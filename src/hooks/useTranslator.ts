import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import { useStorage } from "@/hooks/useStorage";

interface TranslatorStatusItem {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
    progress?: number;
    error?: string;
}

export const useTranslator = () => {
    const { sourceLanguage, targetLanguage } = useStorage()
    const [translatorStatus, setTranslatorStatus] = useState<TranslatorStatusItem>({
        status: 'idle'
    });

    const isTranslatorSupported = useMemo(() => 'Translator' in self, []);
    const sessionRef = useRef<TranslatorInstance | null>(null);
    const isInitializingRef = useRef(false);
    const initControllerRef = useRef<AbortController | null>(null);
    const translateControllerRef = useRef<AbortController | null>(null);

    const currentLanguagesRef = useRef<{ source: string; target: string } | null>(null);

    // Cleanup and reinitialize when languages change
    useEffect(() => {
        // If languages changed and we have an active session, destroy it
        if (sessionRef.current && currentLanguagesRef.current) {
            if (
                currentLanguagesRef.current.source !== sourceLanguage ||
                currentLanguagesRef.current.target !== targetLanguage
            ) {
                initControllerRef.current?.abort();
                translateControllerRef.current?.abort();

                // Cleanup session
                sessionRef.current.destroy();
                sessionRef.current = null;
                currentLanguagesRef.current = null;
                setTranslatorStatus({ status: 'idle' });
            }
        }

        return () => {
            // Abort any ongoing operations
            initControllerRef.current?.abort();
            translateControllerRef.current?.abort();

            // Cleanup session
            if (sessionRef.current) {
                sessionRef.current.destroy();
                sessionRef.current = null;
                currentLanguagesRef.current = null;
            }
        };
    }, [sourceLanguage, targetLanguage]);

    const initLanguageTranslator = useCallback(async (initSourceLang: string, initTargetLang: string) => {
        // Check if we need to reinitialize due to language change
        if (sessionRef.current && currentLanguagesRef.current) {
            if (
                currentLanguagesRef.current.source !== initSourceLang ||
                currentLanguagesRef.current.target !== initTargetLang
            ) {
                sessionRef.current.destroy();
                sessionRef.current = null;
                currentLanguagesRef.current = null;
            }
        }

        // Prevent concurrent initializations
        if (isInitializingRef.current) return;
        if (sessionRef.current && translatorStatus.status === 'ready') return;

        if (!isTranslatorSupported) {
            setTranslatorStatus({
                status: 'error',
                error: 'Translator API is not supported in this environment.',
            });

            throw new Error('Translator API is not supported in this environment.');
        }

        // Abort previous initialization if any
        initControllerRef.current?.abort();
        initControllerRef.current = new AbortController();
        const signal = initControllerRef.current.signal;

        isInitializingRef.current = true;
        setTranslatorStatus({ status: 'checking' });

        try {
            const availability = await window.Translator.availability({
                sourceLanguage: initSourceLang,
                targetLanguage: initTargetLang,
            });

            // Check if aborted
            if (signal.aborted) {
                return;
            }

            if (availability === 'unavailable') {
                setTranslatorStatus({
                    status: 'error',
                    error: 'Translator model is unavailable for the selected languages.',
                });

                throw new Error('Translator model is unavailable for the selected languages.');
            } else {
                if (!navigator.userActivation.isActive) {
                    setTranslatorStatus({
                        status: 'error',
                        error: 'User interaction required to download translation model.',
                    });

                    throw new Error('User interaction required to download translation model.');
                }

                // Create the session with abort signal and download monitoring
                sessionRef.current = await window.Translator.create({
                    sourceLanguage: initSourceLang,
                    targetLanguage: initTargetLang,
                    signal,
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            if (!signal.aborted) {
                                setTranslatorStatus({
                                    status: 'downloading',
                                    progress: e.loaded,
                                });
                            }
                        });
                    },
                });
            }

            // Check if aborted after creation
            if (signal.aborted) {
                sessionRef.current?.destroy();
                sessionRef.current = null;
                currentLanguagesRef.current = null;
                return;
            }

            // Store the languages used for this session
            currentLanguagesRef.current = {
                source: initSourceLang,
                target: initTargetLang
            };

            setTranslatorStatus({ status: 'ready' });
        } catch (error) {
            // Don't set error state if aborted
            if (signal.aborted) {
                return;
            }

            setTranslatorStatus({
                status: 'error',
                error: error instanceof Error ? error?.message : 'Failed to initialize translator',
            });

            throw error;
        } finally {
            isInitializingRef.current = false;
            // Clear controller if it matches current one
            if (initControllerRef.current?.signal === signal) {
                initControllerRef.current = null;
            }
        }
    }, [isTranslatorSupported, translatorStatus.status]);

    const handleTranslateStreaming = useCallback(async function* (text: string): AsyncGenerator<string, void, unknown> {
        // Abort previous translation if any
        translateControllerRef.current?.abort();
        translateControllerRef.current = new AbortController();
        const signal = translateControllerRef.current.signal;

        try {
            // Check if we need to reinitialize due to language change
            if (sessionRef.current && currentLanguagesRef.current) {
                if (
                    currentLanguagesRef.current.source !== sourceLanguage ||
                    currentLanguagesRef.current.target !== targetLanguage
                ) {
                    sessionRef.current.destroy();
                    sessionRef.current = null;
                    currentLanguagesRef.current = null;
                }
            }

            console.log('sessionRef', sessionRef)

            // Initialize if needed
            if (!sessionRef.current) {
                console.log('run', sessionRef)
                await initLanguageTranslator(sourceLanguage, targetLanguage);
            }

            // Check if aborted after initialization
            if (signal.aborted) {
                return;
            }

            if (sessionRef?.current) {
                const stream = sessionRef.current.translateStreaming(text.trim().replace(/\n/g, '<br>'), { signal });

                // Check if aborted
                if (signal.aborted) {
                    return;
                }

                const reader = stream.getReader();

                try {
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done || signal.aborted) {
                            break;
                        }

                        yield value;
                    }
                } finally {
                    reader.releaseLock();
                }
            }

        } catch (error) {
            // Don't update state if aborted
            if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
                return;
            }

            setTranslatorStatus(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error?.message : 'Translation failed',
            }));
            throw error;
        } finally {
            // Clear controller if it matches current one
            if (translateControllerRef.current?.signal === signal) {
                translateControllerRef.current = null;
            }
        }
    }, [initLanguageTranslator, sourceLanguage, targetLanguage]);

    const abortTranslation = useCallback(() => {
        translateControllerRef.current?.abort();
        translateControllerRef.current = null;
    }, []);

    const abortInitialization = useCallback(() => {
        initControllerRef.current?.abort();
        initControllerRef.current = null;
        isInitializingRef.current = false;
    }, []);

    const destroySession = useCallback(() => {
        // Abort any ongoing operations
        initControllerRef.current?.abort();
        translateControllerRef.current?.abort();

        if (sessionRef.current) {
            sessionRef.current.destroy();
            sessionRef.current = null;
            currentLanguagesRef.current = null;
            setTranslatorStatus({ status: 'idle' });
        }
    }, []);

    return {
        translatorStatus,
        isTranslatorSupported,
        initLanguageTranslator,
        destroySession,
        handleTranslateStreaming,
        abortTranslation,
        abortInitialization,
    };
}