import { useCallback, useEffect, useState, useMemo } from 'react';
import { translatorService } from '@/services/chrome/translatorService';

interface TranslatorStatusItem {
  status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

export const useTranslator = () => {
  const [translatorStatus, setTranslatorStatus] = useState<TranslatorStatusItem>({
    status: 'idle',
  });

  const isTranslatorSupported = useMemo(() => translatorService.isTranslatorSupported(), []);

  // Subscribe to status changes from the singleton service
  useEffect(() => {
    const unsubscribe = translatorService.subscribeToStatus(status => {
      setTranslatorStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const initLanguageTranslator = useCallback(
    async (initSourceLang: string, initTargetLang: string) => {
      await translatorService.initializeTranslator(initSourceLang, initTargetLang);
    },
    []
  );

  const handleTranslateStreaming = useCallback(async function* (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): AsyncGenerator<string, void, unknown> {
    yield* translatorService.translateStreaming(text, sourceLanguage, targetLanguage);
  }, []);

  const abortTranslation = useCallback(() => {
    translatorService.abortTranslation();
  }, []);

  const abortInitialization = useCallback(() => {
    translatorService.abortInitialization();
  }, []);

  const destroySession = useCallback(() => {
    translatorService.destroySession();
  }, []);

  return {
    translatorStatus,
    isTranslatorSupported,
    initLanguageTranslator,
    destroySession,
    isLoading: translatorStatus.status === 'checking' || translatorStatus.status === 'downloading',
    handleTranslateStreaming,
    abortTranslation,
    abortInitialization,
  };
};
