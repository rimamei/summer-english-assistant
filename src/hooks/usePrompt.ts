import { useCallback, useEffect, useRef, useState, useMemo } from "react"

interface PromptStatusItem {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
    progress?: number;
    error?: string;
}

export const usePrompt = () => {
    const [promptStatus, setPromptStatus] = useState<PromptStatusItem>({
        status: 'idle'
    });

    const isPromptSupported = useMemo(() => 'LanguageModel' in self, []);
    const sessionRef = useRef<PromptSession | null>(null);
    const isInitializingRef = useRef(false);
    const initControllerRef = useRef<AbortController | null>(null);
    const promptControllerRef = useRef<AbortController | null>(null);

    const currentConfigRef = useRef<{ temperature?: number; topK?: number } | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Abort any ongoing operations
            initControllerRef.current?.abort();
            promptControllerRef.current?.abort();

            // Cleanup session
            if (sessionRef.current) {
                sessionRef.current.destroy();
                sessionRef.current = null;
                currentConfigRef.current = null;
            }
        };
    }, []);

    const initPromptSession = useCallback(async (
        createOptions?: LanguageModelCreateOptions
    ) => {
        const newTemp = createOptions?.temperature;
        const newTopK = createOptions?.topK;

        // Check if we need to reinitialize due to config change
        if (sessionRef.current && currentConfigRef.current) {
            initControllerRef.current?.abort();
            promptControllerRef.current?.abort();

            sessionRef.current.destroy();
            sessionRef.current = null;
            currentConfigRef.current = null;
            setPromptStatus({ status: 'idle' });

        }

        if (!isPromptSupported) {
            setPromptStatus({
                status: 'error',
                error: 'LanguageModel API is not supported in this environment.',
            });
            throw new Error('LanguageModel API is not supported in this environment.');
        }

        // Abort previous initialization if any
        initControllerRef.current?.abort();
        initControllerRef.current = new AbortController();
        const signal = initControllerRef.current.signal;

        isInitializingRef.current = true;
        setPromptStatus({ status: 'checking' });

        try {
            const availability = await window.LanguageModel.availability();

            if (signal.aborted) {
                return;
            }

            if (availability === 'unavailable') {
                setPromptStatus({
                    status: 'error',
                    error: 'LanguageModel model is unavailable.',
                });
                throw new Error('LanguageModel model is unavailable.');
            }

            if (availability === 'downloadable' || availability === 'downloading') {
                sessionRef.current = await window.LanguageModel.create({
                    ...createOptions,
                    signal,
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            if (!signal.aborted) {
                                setPromptStatus({
                                    status: 'downloading',
                                    progress: e.loaded,
                                });
                            }
                        });
                    },
                });
            } else if (availability === 'available') {
                sessionRef.current = await window.LanguageModel.create({
                    ...createOptions,
                    signal
                });
            }

            if (signal.aborted) {
                sessionRef.current?.destroy();
                sessionRef.current = null;
                currentConfigRef.current = null;
                return;
            }

            // Store the config used for this session
            currentConfigRef.current = {
                temperature: newTemp,
                topK: newTopK
            };

            setPromptStatus({ status: 'ready' });
        } catch (error) {
            if (signal.aborted) {
                return;
            }

            setPromptStatus({
                status: 'error',
                error: error instanceof Error ? error?.message : 'Failed to initialize prompt session',
            });
            throw error;
        } finally {
            isInitializingRef.current = false;
            if (initControllerRef.current?.signal === signal) {
                initControllerRef.current = null;
            }
        }
    }, [isPromptSupported]);

    const handlePrompt = useCallback(async (
        input: string | LanguageModelPrompt[],
        operationOptions?: PromptOperationOptions,
        createOptions?: LanguageModelCreateOptions
    ) => {

        // Don't abort previous prompt here - let it complete or handle externally
        // promptControllerRef.current?.abort();
        promptControllerRef.current = new AbortController();
        const signal = promptControllerRef.current.signal;

        const combinedOperationOptions = { ...(operationOptions ?? {}), signal };

        try {
            // Initialize if needed
            if (!sessionRef?.current) {
                await initPromptSession(createOptions);
            }

            if (signal.aborted) {
                throw new DOMException('Prompt aborted', 'AbortError');
            }

            if (sessionRef?.current) {
                const result = await sessionRef?.current.prompt(input, combinedOperationOptions);

                if (signal.aborted) {
                    throw new DOMException('Prompt aborted', 'AbortError');
                }

                return result;
            }
        } catch (error) {

            if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
                throw error;
            }

            // Set error state for non-abort errors
            setPromptStatus(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error?.message : 'Prompt failed',
            }));
            throw error;
        } finally {
            if (promptControllerRef.current?.signal === signal) {
                promptControllerRef.current = null;
            }
        }
    }, [initPromptSession]);

    const handlePromptStreaming = useCallback(async function* (
        input: string | LanguageModelPrompt[],
        operationOptions?: PromptOperationOptions,
        createOptions?: LanguageModelCreateOptions
    ): AsyncGenerator<string, void, unknown> {

        // Abort previous prompt if any
        promptControllerRef.current?.abort();
        promptControllerRef.current = new AbortController();
        const signal = promptControllerRef.current.signal;

        const combinedOperationOptions = { ...(operationOptions ?? {}), signal };

        try {
            await initPromptSession(createOptions);

            if (signal.aborted) return;

            if (!sessionRef.current) {
                throw new Error('Failed to create session');
            }

            const stream = sessionRef.current.promptStreaming(input, combinedOperationOptions);

            if (signal.aborted) return;

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

            setPromptStatus(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error?.message : 'Prompt failed',
            }));
            throw error;
        } finally {
            if (promptControllerRef.current?.signal === signal) {
                promptControllerRef.current = null;
            }
        }
    }, [initPromptSession]);

    const abortPrompt = useCallback(() => {
        promptControllerRef.current?.abort();
        promptControllerRef.current = null;
    }, []);

    const abortInitialization = useCallback(() => {
        initControllerRef.current?.abort();
        initControllerRef.current = null;
        isInitializingRef.current = false;
    }, []);

    const destroySession = useCallback(() => {
        initControllerRef.current?.abort();
        promptControllerRef.current?.abort();

        if (sessionRef.current) {
            sessionRef.current.destroy();
            sessionRef.current = null;
            currentConfigRef.current = null;
            setPromptStatus({ status: 'idle' });
        }
    }, []);

    return {
        promptStatus,
        isPromptSupported,
        initPromptSession,
        destroySession,
        handlePrompt,
        handlePromptStreaming,
        abortPrompt,
        abortInitialization,
        setPromptStatus
    };
}