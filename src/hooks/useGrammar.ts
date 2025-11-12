import { useState, useCallback, useEffect, useMemo } from 'react';
import { grammarService } from '@/services/chrome/grammarService';
import type { IGrammarData } from '@/type';

interface GrammarStatusItem {
  status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

interface AnalyzeSentenceParams {
  sentence: string;
  sourceLanguage: string;
  targetLanguage: string;
  onChunk?: (chunk: string) => void;
}

export const useGrammar = () => {
  const [grammarStatus, setGrammarStatus] = useState<GrammarStatusItem>({
    status: 'idle',
  });
  const [isLoading, setIsLoading] = useState(false);

  const isGrammarSupported = useMemo(() => grammarService.isGrammarSupported(), []);

  // Subscribe to status changes from the singleton service
  useEffect(() => {
    const unsubscribe = grammarService.subscribeToStatus(status => {
      setGrammarStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const analyzeSentence = useCallback(
    async ({
      sentence,
      sourceLanguage,
      targetLanguage,
      onChunk,
    }: AnalyzeSentenceParams): Promise<IGrammarData | null> => {
      setIsLoading(true);

      try {
        const result = await grammarService.analyzeSentence(
          sentence,
          sourceLanguage,
          targetLanguage,
          onChunk
        );
        setIsLoading(false);
        return result;
      } catch (error: unknown) {
        setIsLoading(false);

        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to analyze grammar: ${errorMessage}`);
      }
    },
    []
  );

  const abortAnalysis = useCallback(() => {
    grammarService.abortAnalysis();
  }, []);

  const abortInitialization = useCallback(() => {
    grammarService.abortInitialization();
  }, []);

  const destroySession = useCallback(() => {
    grammarService.destroySession();
  }, []);

  return {
    analyzeSentence,
    isLoading,
    grammarStatus,
    isGrammarSupported,
    abortAnalysis,
    abortInitialization,
    destroySession,
  };
};
