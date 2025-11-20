import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { classes } from '../style';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useGrammar } from '@/hooks/useGrammar';
import { generateStream } from '@/services/gemini';
import { createScreenshotContent, createTextContent } from '../../../utils/promptConfig';
import { GRAMMAR_CONFIG } from './constants';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import { createGrammarPrompt } from '@/prompt/gemini/grammar';
import GeminiContent from './GeminiContent';
import ChromeContent from './ChromeContent';

const GrammarAnalyzer = () => {
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { sourceLanguage, targetLanguage, isLightTheme, preferences } = useStorage();
  const { analyzeSentence, isLoading: isLoadingGrammar, grammarStatus } = useGrammar();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText, mode, screenshotData },
  } = useExtension();

  // Agent-specific handlers
  const handleChromeGrammarAnalysis = useCallback(async () => {
    await analyzeSentence({
      sentence: selectedText,
      sourceLanguage: sourceLanguage || '',
      targetLanguage: targetLanguage || '',
      onChunk: chunk => {
        if (!chunk) return;

        setStreamingContent(chunk);
      },
    });
  }, [analyzeSentence, selectedText, sourceLanguage, targetLanguage]);

  const handleGeminiGrammarAnalysis = useCallback(async () => {
    const config = {
      temperature: GRAMMAR_CONFIG.temperature,
      maxOutputTokens: GRAMMAR_CONFIG.maxOutputTokens,
    };

    const prompt = createGrammarPrompt(selectedText, sourceLanguage || '', targetLanguage || '');

    const contents =
      mode === 'screenshot'
        ? createScreenshotContent(screenshotData, prompt)
        : createTextContent(prompt);

    await generateStream(
      {
        model: preferences?.model ?? '',
        contents,
        config,
      },
      chunk => {
        if (!chunk) return;

        setStreamingContent(chunk);
      }
    );
  }, [selectedText, sourceLanguage, targetLanguage, mode, screenshotData, preferences?.model]);

  // Main analyze handler
  const handleAnalyzeSentence = useCallback(async () => {
    if (!sourceLanguage || !targetLanguage) return;

    // Reset state
    setError('');
    setIsLoading(true);

    const agent = preferences?.agent || 'chrome';

    try {
      if (agent === 'chrome') {
        await handleChromeGrammarAnalysis();
      } else if (agent === 'gemini') {
        await handleGeminiGrammarAnalysis();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Grammar analysis failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    sourceLanguage,
    targetLanguage,
    preferences?.agent,
    handleChromeGrammarAnalysis,
    handleGeminiGrammarAnalysis,
  ]);

  // Helper: Check if analysis should trigger
  const shouldAnalyze = useMemo(() => {
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

  // Trigger analysis when conditions are met
  useEffect(() => {
    if (shouldAnalyze) {
      lastAnalyzedRef.current = selectedText;
      handleAnalyzeSentence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAnalyze]);

  const sanitizeHtml = useSafeMarkdown(streamingContent);

  return (
    <div
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#f3f4f6',
        userSelect: 'text',
        cursor: 'text',
        lineHeight: '1.6',
        minHeight: '50px',
      }}
      onClick={e => e.stopPropagation()}
    >
      {preferences?.agent === 'gemini' ? (
        <GeminiContent
          isLoading={isLoading && !sanitizeHtml}
          error={error}
          sanitizeHtml={sanitizeHtml}
          isLightTheme={isLightTheme}
        />
      ) : (
        <ChromeContent
          isLoadingGrammar={isLoadingGrammar}
          grammarStatus={grammarStatus}
          error={error}
          sanitizeHtml={sanitizeHtml}
          isLightTheme={isLightTheme}
        />
      )}
    </div>
  );
};

export default GrammarAnalyzer;
