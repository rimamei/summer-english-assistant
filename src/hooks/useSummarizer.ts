import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Configuration options for the summarizer, based on SummarizerAvailabilityOptions.
 */
export interface SummarizerConfig {
    expectedInputLanguages: string[];
    expectedContextLanguages: string[];
    format: 'plain-text' | 'markdown';
    length: 'short' | 'medium' | 'long';
    outputLanguage: string;
    type: 'headline' | 'key-points' | 'teaser' | 'tldr';
}

/**
 * Status item for the summarizer state.
 */
export interface SummarizerStatusItem {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
    progress?: number; // Progress as a percentage (0-100)
    error?: string;
}

/**
 * A custom React hook to manage the lifecycle and operations of the
 * Web Summarizer API (window.Summarizer).
 */
export const useSummarizer = () => {
    const [summarizerStatus, setSummarizerStatus] = useState<SummarizerStatusItem>({
        status: 'idle'
    });

    const isSummarizerSupported = useMemo(() => typeof self !== 'undefined' && 'Summarizer' in self, []);
    const sessionRef = useRef<SummarizerInstance | null>(null);
    const isInitializingRef = useRef(false);
    const initControllerRef = useRef<AbortController | null>(null);
    const summarizeControllerRef = useRef<AbortController | null>(null);

    const currentConfigRef = useRef<SummarizerConfig | null>(null);

    useEffect(() => {
        // Only run cleanup on unmount
        return () => {
            // Abort any ongoing operations
            initControllerRef.current?.abort();
            summarizeControllerRef.current?.abort();

            // Cleanup session
            if (sessionRef.current) {
                sessionRef.current.destroy();
                sessionRef.current = null;
                currentConfigRef.current = null;
            }
        };
    }, []); // Empty dependency array means this runs only on mount/unmount

    /**
     * Initializes the Summarizer session based on the provided config.
     * @param newConfig The configuration for the summarizer session.
     */
    const initSummarizer = useCallback(async (newConfig: SummarizerConfig) => {
        if (sessionRef.current && currentConfigRef.current) {
            if (JSON.stringify(currentConfigRef.current) !== JSON.stringify(newConfig)) {
                initControllerRef.current?.abort();
                summarizeControllerRef.current?.abort();
                sessionRef.current.destroy();
                sessionRef.current = null;
                currentConfigRef.current = null;
                setSummarizerStatus({ status: 'idle' });
            }
        }

        // Prevent concurrent initializations
        if (isInitializingRef.current) return;
        // If session exists and is ready with the same config, do nothing
        if (sessionRef.current && summarizerStatus.status === 'ready') return;

        if (!isSummarizerSupported) {
            setSummarizerStatus({
                status: 'error',
                error: 'Summarizer API is not supported in this environment.',
            });
            throw new Error('Summarizer API is not supported in this environment.');
        }

        // Abort previous initialization if any
        initControllerRef.current?.abort();
        initControllerRef.current = new AbortController();
        const signal = initControllerRef.current.signal;

        isInitializingRef.current = true;
        setSummarizerStatus({ status: 'checking' });

        try {
            const availability = await window.Summarizer.availability(newConfig);

            if (signal.aborted) return;

            if (availability === 'unavailable') {
                setSummarizerStatus({ status: 'error', error: 'Summarizer model is unavailable. Please only specify supported language: English, Japanese, and Spanish.' });

                throw new Error('Summarizer model is unavailable. Please only specify supported language: English, Japanese, and Spanish.');
            }

            // Check for user activation if a download is required
            if (availability === 'downloadable' || availability === 'downloading') {
                sessionRef.current = await window.Summarizer.create({
                    ...newConfig,
                    signal,
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            if (!signal.aborted) {
                                setSummarizerStatus({
                                    status: 'downloading',
                                    // e.loaded is 0-1, convert to percentage
                                    progress: Math.round(e.loaded * 100),
                                });
                            }
                        });
                    },
                });

                setSummarizerStatus({ status: 'ready' });
            }

            if (availability === 'available') {
                // Create the session
                sessionRef.current = await window.Summarizer.create({
                    ...newConfig,
                    signal,

                });
                setSummarizerStatus({ status: 'ready' });
            }


            if (signal.aborted) {
                sessionRef.current?.destroy();
                sessionRef.current = null;
                currentConfigRef.current = null;
                return;
            }

            // Store the config used for this session
            currentConfigRef.current = newConfig;
             setSummarizerStatus({ status: 'idle' });

        } catch (error) {
            if (signal.aborted) return;

            setSummarizerStatus({
                status: 'error',
                error: error instanceof Error ? error?.message : 'Failed to initialize summarizer',
            });
            throw error;
        } finally {
            isInitializingRef.current = false;
            if (initControllerRef.current?.signal === signal) {
                initControllerRef.current = null;
            }
        }
    }, [isSummarizerSupported, summarizerStatus.status]);

    /**
     * Generates a summary from the input text as an AsyncGenerator.
     * @param text The text to summarize.
     * @param newConfig The configuration for the summarizer session.
     */
    const handleSummarizeStreaming = useCallback(async function* (
        text: string,
        newConfig: SummarizerConfig // Config is now a parameter
    ): AsyncGenerator<string, void, unknown> {

        // Abort previous summarization if any
        summarizeControllerRef.current?.abort();
        summarizeControllerRef.current = new AbortController();
        const signal = summarizeControllerRef.current.signal;

        try {
            // First, ensure the summarizer is initialized with the current config
            // This will be fast if it's already initialized with the same config.
            await initSummarizer(newConfig);

            // Check if initialized. initSummarizer must be called beforehand.
            if (!sessionRef.current) {
                throw new Error("Summarizer not ready. Initialization failed.");
            }

            // Config change check is handled by initSummarizer, so we can proceed.
            if (signal.aborted) return;

            if (sessionRef?.current) {
                const stream = sessionRef.current.summarizeStreaming(text.trim().replace(/\n/g, '<br>'), { signal });

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
            }

        } catch (error) {
            if (signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
                return;
            }
            throw error;
        } finally {
            if (summarizeControllerRef.current?.signal === signal) {
                summarizeControllerRef.current = null;
            }
        }
    }, [initSummarizer]);


    const abortSummarization = useCallback(() => {
        summarizeControllerRef.current?.abort();
        summarizeControllerRef.current = null;
    }, []);

    const abortInitialization = useCallback(() => {
        initControllerRef.current?.abort();
        initControllerRef.current = null;
        isInitializingRef.current = false;
    }, []);

    const destroySession = useCallback(() => {
        initControllerRef.current?.abort();
        summarizeControllerRef.current?.abort();

        if (sessionRef.current) {
            sessionRef.current.destroy();
            sessionRef.current = null;
            currentConfigRef.current = null;
            setSummarizerStatus({ status: 'idle' });
        }
    }, []);

    return {
        summarizerStatus,
        isSummarizerSupported,
        initSummarizer,
        destroySession,
        handleSummarizeStreaming,
        abortSummarization,
        abortInitialization,
    };
}

