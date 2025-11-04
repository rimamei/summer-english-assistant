import { useState, useCallback, useEffect, useMemo } from 'react';
import { pronunciationService } from '@/services/pronunciationService';
import type { PronunciationAnalysis } from '@/services/pronunciationService';

export type { PronunciationAnalysis };

interface PronunciationStatusItem {
  status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

interface AnalyzeWordParams {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export const usePronunciation = () => {
  const [pronunciationStatus, setPronunciationStatus] = useState<PronunciationStatusItem>({
    status: 'idle'
  });
  const [isLoading, setIsLoading] = useState(false);

  const isPronunciationSupported = useMemo(() => pronunciationService.isPronunciationSupported(), []);

  // Subscribe to status changes from the singleton service
  useEffect(() => {
    const unsubscribe = pronunciationService.subscribeToStatus((status) => {
      setPronunciationStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const analyzeWord = useCallback(
    async ({ word, sourceLanguage, targetLanguage }: AnalyzeWordParams
    ): Promise<PronunciationAnalysis> => {
      setIsLoading(true);

      try {
        const result = await pronunciationService.analyzeWord(word, sourceLanguage, targetLanguage);
        setIsLoading(false);
        return result;
      } catch (error: unknown) {
        setIsLoading(false);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to analyze pronunciation: ${errorMessage}`);
      }
    },
    [],
  );

  const abortAnalysis = useCallback(() => {
    pronunciationService.abortAnalysis();
  }, []);

  const abortInitialization = useCallback(() => {
    pronunciationService.abortInitialization();
  }, []);

  const destroySession = useCallback(() => {
    pronunciationService.destroySession();
  }, []);

  return {
    analyzeWord,
    isLoading,
    pronunciationStatus,
    isPronunciationSupported,
    abortAnalysis,
    abortInitialization,
    destroySession,
  };
};