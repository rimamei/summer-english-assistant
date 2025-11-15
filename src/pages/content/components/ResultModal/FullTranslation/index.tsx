import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { classes } from '../style';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useTranslator } from '@/hooks/useTranslator';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import { generateStream } from '@/services/gemini';
import { createTranslationPrompt } from '@/prompt/gemini/translation';
import type { ContentListUnion } from '@google/genai';
import Skeleton from '../../Skeleton';

const FullTranslation = () => {
  const [translationText, setTranslationText] = useState('');
  const { sourceLanguage, targetLanguage, preferences } = useStorage();
  const {
    state: { mode, screenshotData },
  } = useExtension();

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

      const agent = preferences?.agent;

      // Check if using Gemini agent
      if (agent === 'gemini') {
        const prompt = createTranslationPrompt(selectedText, sourceLanguage!, targetLanguage!);

        let contents: ContentListUnion = [{ role: 'user', parts: [{ text: prompt }] }];

        if (mode === 'screenshot') {
          // Convert base64 image to the format Gemini expects
          const base64Data = screenshotData?.split(',')[1];
          const mimeType = screenshotData?.split(';')[0].split(':')[1];

          contents = [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ];
        }

        await generateStream(
          {
            model: preferences?.model || 'gemini-2.0-flash-exp',
            contents,
            config: {
              maxOutputTokens: 2048,
            },
          },
          text => {
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
      const errorMessage = err instanceof Error ? err.message : 'Summarization failed';
      setError(errorMessage);
      setTranslationText('');
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    handleTranslateStreaming,
    selectedText,
    sourceLanguage,
    targetLanguage,
    preferences,
    screenshotData,
  ]);

  useEffect(() => {
    const highlightMode =
      selectedText && selectedText !== lastAnalyzedRef.current && mode === 'highlight';
    const screenshotMode = screenshotData && mode === 'screenshot';
    const model = preferences?.agent === 'gemini' ? !!preferences?.model : true;

    if (
      (highlightMode || screenshotMode) &&
      sourceLanguage &&
      targetLanguage &&
      preferences?.agent &&
      model
    ) {
      lastAnalyzedRef.current = selectedText;
      handleFullTranslation();
    }
  }, [
    handleFullTranslation,
    selectedText,
    sourceLanguage,
    targetLanguage,
    screenshotData,
    mode,
    preferences?.agent,
    preferences?.model,
  ]);

  const sanitizedHtml = useSafeMarkdown(translationText);

  return (
    <span
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#e5e7eb',
        userSelect: 'text',
        cursor: 'text',
      }}
      onClick={e => e.stopPropagation()}
    >
      {isTranslating ? (
        <>
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} width="100%" height="1em" isLightTheme={isLightTheme} />
            ))}
        </>
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
