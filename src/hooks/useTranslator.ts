import { useCallback, useEffect, useRef, useState, useMemo } from "react"

interface TranslatorStatusItem {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
    progress?: number;
    error?: string;
}

export const useTranslator = () => {
    const [translatorStatus, setTranslatorStatus] = useState<TranslatorStatusItem>({
        status: 'idle'
    });

    const isTranslatorSupported = useMemo(() => 'Translator' in self, []);
    const sessionRef = useRef<TranslatorInstance | null>(null);
    const isInitializingRef = useRef(false);
    const initControllerRef = useRef<AbortController | null>(null);
    const translateControllerRef = useRef<AbortController | null>(null);

    const currentLanguagesRef = useRef<{ source: string; target: string } | null>(null);

    useEffect(() => {
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
    }, []);

    const initLanguageTranslator = useCallback(async (initSourceLang: string, initTargetLang: string) => {

        // Check if we need to reinitialize due to language change
        if (sessionRef.current && currentLanguagesRef.current) {
            if (
                currentLanguagesRef.current.source !== initSourceLang ||
                currentLanguagesRef.current.target !== initTargetLang
            ) {
                initControllerRef.current?.abort();
                translateControllerRef.current?.abort();

                sessionRef.current.destroy();
                sessionRef.current = null;
                currentLanguagesRef.current = null;
                setTranslatorStatus({ status: 'idle' });
            }
        }

        // If session already exists with same languages, don't reinitialize
        if (sessionRef.current && currentLanguagesRef.current) {
            if (
                currentLanguagesRef.current.source === initSourceLang &&
                currentLanguagesRef.current.target === initTargetLang
            ) {
                return;
            }
        }

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

            if (signal.aborted) {
                return;
            }

            if (availability === 'unavailable') {
                setTranslatorStatus({
                    status: 'error',
                    error: 'Translator model is unavailable for the selected languages.',
                });
                throw new Error('Translator model is unavailable for the selected languages.');
            }

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
            if (initControllerRef.current?.signal === signal) {
                initControllerRef.current = null;
            }
        }
    }, [isTranslatorSupported]);

    const handleTranslateStreaming = useCallback(async function* (
        text: string,
        sourceLanguage: string,
        targetLanguage: string
    ): AsyncGenerator<string, void, unknown> {
        // Abort previous translation if any
        translateControllerRef.current?.abort();
        translateControllerRef.current = new AbortController();
        const signal = translateControllerRef.current.signal;

        try {
            // Always initialize - it will handle whether to recreate or not
            await initLanguageTranslator(sourceLanguage, targetLanguage);

            if (!sessionRef.current) {
                throw new Error('Failed to create session');
            }

            if (signal.aborted) {
                return;
            }

            const stream = sessionRef.current.translateStreaming(
                text.trim().replace(/\n/g, '<br>'), 
                { signal }
            );

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
        } catch (error) {
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
            if (translateControllerRef.current?.signal === signal) {
                translateControllerRef.current = null;
            }
        }
    }, [initLanguageTranslator]);

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
        initControllerRef.current?.abort();
        translateControllerRef.current?.abort();

        if (sessionRef.current) {
            sessionRef.current.destroy();
            sessionRef.current = null;
            currentLanguagesRef.current = null;
            setTranslatorStatus({ status: 'idle' });
        }
    }, []);

    const isLoading = useMemo(() => {
        return translatorStatus.status === 'checking' || translatorStatus.status === 'downloading';
    }, [translatorStatus.status]);

    return {
        translatorStatus,
        isTranslatorSupported,
        isLoading,
        initLanguageTranslator,
        destroySession,
        handleTranslateStreaming,
        abortTranslation,
        abortInitialization,
    };
}