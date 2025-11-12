import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useI18n } from '@/hooks/useI18n';
import { useTranslator } from '@/hooks/useTranslator';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import { generateStream } from '@/services/gemini';
import { createTranslationPrompt } from '@/prompt/gemini/translation';

const FullTranslation = () => {
  const { t } = useI18n();
  const [translationText, setTranslationText] = useState('');
  const { sourceLanguage, targetLanguage, preferences } = useStorage();

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { isLightTheme } = useStorage();
  const {
    handleTranslateStreaming,
    isLoading: isLoadingTranslatorService,
    translatorStatus,
  } = useTranslator();
  const {
    state: { selectedText },
  } = useExtension();

  const lastAnalyzedRef = useRef<string>('');

  // Compute loading state
  const isTranslating = useMemo(() => {
    return (
      isLoading ||
      isLoadingTranslatorService ||
      translatorStatus.status === 'checking' ||
      translatorStatus.status === 'downloading'
    );
  }, [isLoading, isLoadingTranslatorService, translatorStatus.status]);

  // Compute loading message
  const loadingMessage = useMemo(() => {
    if (translatorStatus.status === 'checking') return 'Checking availability';
    if (translatorStatus.status === 'downloading') {
      return `Downloading model${
        translatorStatus.progress
          ? ` ${Math.round(translatorStatus.progress)}%`
          : ''
      }`;
    }
    return t('loading');
  }, [translatorStatus.status, translatorStatus.progress, t]);

  // Compute error state and message
  const hasError = useMemo(() => {
    return !!error || translatorStatus.status === 'error';
  }, [error, translatorStatus.status]);

  const errorMessage = useMemo(() => {
    return error || translatorStatus.error || 'Translation failed';
  }, [error, translatorStatus.error]);

  const handleFullTranslation = useCallback(async () => {
    setIsLoading(true);

    try {
      setError('');
      setTranslationText('');

      // Check if using Gemini agent
      if (preferences?.agent === 'gemini') {
        const prompt = createTranslationPrompt(
          selectedText,
          sourceLanguage!,
          targetLanguage!
        );

        await generateStream(
          {
            model: preferences.model || 'gemini-2.0-flash-exp',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          },
          (text) => {
            setTranslationText(text);
          }
        );

        setIsLoading(false);
      } else {
        // Use Chrome built-in translator
        const stream = await handleTranslateStreaming(
          selectedText,
          sourceLanguage!,
          targetLanguage!
        );

        for await (const chunk of stream) {
          setTranslationText(chunk);
        }

        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      setTranslationText('');
      setIsLoading(false);
    }
  }, [
    handleTranslateStreaming,
    selectedText,
    sourceLanguage,
    targetLanguage,
    preferences,
  ]);

  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      sourceLanguage &&
      targetLanguage
    ) {
      lastAnalyzedRef.current = selectedText;
      handleFullTranslation();
    }
  }, [handleFullTranslation, selectedText, sourceLanguage, targetLanguage]);

  const sanitizedHtml = useSafeMarkdown(translationText);

  return (
    <span
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#e5e7eb',
        userSelect: 'text',
        cursor: 'text',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isTranslating ? (
        <span style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>
          {loadingMessage}
          <LoadingDots />
        </span>
      ) : hasError ? (
        <span style={{ color: '#ef4444' }}>{errorMessage}</span>
      ) : (
        <span
          dangerouslySetInnerHTML={{
            __html: sanitizedHtml ?? '',
          }}
        />
      )}
    </span>
  );
};

export default FullTranslation;
