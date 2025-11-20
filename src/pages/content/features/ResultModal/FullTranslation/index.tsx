import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { classes } from '../style';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useTranslator } from '@/hooks/useTranslator';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import { generateStream } from '@/services/gemini';
import { createTranslationPrompt } from '@/prompt/gemini/translation';
import GeminiContent from './GeminiContent';
import ChromeContent from './ChromeContent';
import { createScreenshotContent, createTextContent } from '../../../utils/promptConfig';

const FullTranslation = () => {
  const [translationText, setTranslationText] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { sourceLanguage, targetLanguage, isLightTheme, preferences } = useStorage();
  const {
    handleTranslateStreaming,
    isLoading: isLoadingTranslator,
    translatorStatus,
  } = useTranslator();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText, mode, screenshotData },
  } = useExtension();

  // Agent-specific handlers
  const handleChromeTranslation = useCallback(async () => {
    const stream = handleTranslateStreaming(selectedText, sourceLanguage!, targetLanguage!);

    for await (const chunk of stream) {
      setTranslationText(chunk);
    }
  }, [handleTranslateStreaming, selectedText, sourceLanguage, targetLanguage]);

  const handleGeminiTranslation = useCallback(async () => {
    const prompt = createTranslationPrompt(selectedText, sourceLanguage!, targetLanguage!);

    const contents =
      mode === 'screenshot'
        ? createScreenshotContent(screenshotData, prompt)
        : createTextContent(prompt);

    await generateStream(
      {
        model: preferences?.model || 'gemini-2.0-flash-exp',
        contents,
        config: {
          maxOutputTokens: 2048,
        },
      },
      chunk => {
        setTranslationText(chunk);
      }
    );
  }, [selectedText, sourceLanguage, targetLanguage, mode, screenshotData, preferences?.model]);

  // Main translation handler
  const handleTranslation = useCallback(async () => {
    if (!sourceLanguage || !targetLanguage) return;

    // Reset state
    setTranslationText('');
    setError('');
    setIsLoading(true);

    const agent = preferences?.agent || 'chrome';

    try {
      if (agent === 'chrome') {
        await handleChromeTranslation();
      } else if (agent === 'gemini') {
        await handleGeminiTranslation();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      setTranslationText('');
    } finally {
      setIsLoading(false);
    }
  }, [
    sourceLanguage,
    targetLanguage,
    preferences?.agent,
    handleChromeTranslation,
    handleGeminiTranslation,
  ]);

  // Helper: Check if translation should trigger
  const shouldTranslate = useMemo(() => {
    const highlightMode =
      selectedText && selectedText !== lastAnalyzedRef.current && mode === 'highlight';
    const screenshotMode = screenshotData && mode === 'screenshot';
    const hasValidModel = preferences?.agent === 'gemini' ? !!preferences?.model : true;
    const hasRequiredLanguages = sourceLanguage && targetLanguage;
    const hasAgent = !!preferences?.agent;

    return (highlightMode || screenshotMode) && hasRequiredLanguages && hasAgent && hasValidModel;
  }, [
    selectedText,
    mode,
    screenshotData,
    preferences?.agent,
    preferences?.model,
    sourceLanguage,
    targetLanguage,
  ]);

  // Trigger translation when conditions are met
  useEffect(() => {
    if (shouldTranslate) {
      lastAnalyzedRef.current = selectedText;
      handleTranslation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldTranslate]);

  const sanitizedHtml = useSafeMarkdown(translationText);

  return (
    <div
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#e5e7eb',
        userSelect: 'text',
        cursor: 'text',
        minHeight: '50px',
      }}
      onClick={e => e.stopPropagation()}
    >
      {preferences?.agent === 'gemini' ? (
        <GeminiContent
          isLoading={isLoading}
          error={error}
          translationText={translationText}
          sanitizedHtml={sanitizedHtml}
          isLightTheme={isLightTheme}
        />
      ) : (
        <ChromeContent
          isLoadingTranslator={isLoadingTranslator && !sanitizedHtml}
          translatorStatus={translatorStatus}
          error={error}
          sanitizedHtml={sanitizedHtml}
          isLightTheme={isLightTheme}
        />
      )}
    </div>
  );
};

export default FullTranslation;
