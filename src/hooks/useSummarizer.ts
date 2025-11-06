import { useCallback, useEffect, useMemo, useState } from "react";
import { summarizerService } from "../services/chrome/summarizerService";
import type { SummarizerConfig } from "../services/chrome/summarizerService";

/**
 * Status item for the summarizer state.
 */
export interface SummarizerStatusItem {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
    progress?: number; // Progress as a percentage (0-100)
    error?: string;
}

// Re-export SummarizerConfig for convenience
export type { SummarizerConfig };

/**
 * A custom React hook to manage the lifecycle and operations of the
 * Web Summarizer API using the singleton summarizerService.
 */
export const useSummarizer = () => {
    const [summarizerStatus, setSummarizerStatus] = useState<SummarizerStatusItem>({
        status: 'idle'
    });

    const isSummarizerSupported = useMemo(() => summarizerService.isSummarizerSupported(), []);

    useEffect(() => {
        // Subscribe to status changes from the service
        const unsubscribe = summarizerService.subscribeToStatus(setSummarizerStatus);

        // Cleanup on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    /**
     * Initializes the Summarizer session based on the provided config.
     * @param config The configuration for the summarizer session.
     */
    const initSummarizer = useCallback(async (config: SummarizerConfig) => {
        await summarizerService.initializeSummarizer(config);
    }, []);

    /**
     * Generates a summary from the input text as an AsyncGenerator.
     * @param text The text to summarize.
     * @param config The configuration for the summarizer session.
     */
    const handleSummarizeStreaming = useCallback(async function* (
        text: string,
        config: SummarizerConfig
    ): AsyncGenerator<string, void, unknown> {
        yield* summarizerService.summarizeStreaming(text, config);
    }, []);

    const abortSummarization = useCallback(() => {
        summarizerService.abortSummarization();
    }, []);

    const abortInitialization = useCallback(() => {
        summarizerService.abortInitialization();
    }, []);

    const destroySession = useCallback(() => {
        summarizerService.destroySession();
    }, []);

    return {
        summarizerStatus,
        isSummarizerSupported,
        initSummarizer,
        destroySession,
        isLoading: summarizerStatus.status === 'checking' || summarizerStatus.status === 'downloading',
        handleSummarizeStreaming,
        abortSummarization,
        abortInitialization,
    };
}
