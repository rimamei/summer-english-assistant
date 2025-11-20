import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { classes } from '../style';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useSummarizer } from '@/hooks/useSummarizer';
import { useStorage } from '@/hooks/useStorage';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import type { ISummarizerData } from '@/type';
import { generateStream } from '@/services/gemini';
import { createSummarizerPrompt } from '@/prompt/gemini/summarizer';
import { summarizerSchema } from '@/prompt/schema/summarizerSchema';
import GeminiContent from './GeminiContent';
import ChromeContent from './ChromeContent';
import {
  createScreenshotContent,
  createSummarizerChromeConfig,
  createTextContent,
} from '../../../utils/promptConfig';
import { SUMMARIZER_CONFIG } from './constants';

const Summarization = () => {
  const [explanation, setExplanation] = useState('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { isLightTheme, sourceLanguage, targetLanguage, preferences } = useStorage();
  const {
    handleSummarizeStreaming,
    isLoading: isLoadingSummarizer,
    summarizerStatus,
  } = useSummarizer();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText, mode, screenshotData },
  } = useExtension();

  // Agent-specific handlers
  const handleChromeSummarization = useCallback(async () => {
    const config = createSummarizerChromeConfig(
      sourceLanguage,
      targetLanguage,
      SUMMARIZER_CONFIG.summaryLength
    );
    const result = handleSummarizeStreaming(selectedText, config);

    let text = '';
    for await (const chunk of result) {
      text += chunk;
    }

    setExplanation(text || '');
  }, [handleSummarizeStreaming, selectedText, sourceLanguage, targetLanguage]);

  const handleGeminiSummarization = useCallback(async () => {
    const config = {
      temperature: SUMMARIZER_CONFIG.temperature,
      maxOutputTokens: SUMMARIZER_CONFIG.maxOutputTokens,
      responseMimeType: 'application/json',
      responseSchema: summarizerSchema,
    };

    const prompt = createSummarizerPrompt(
      selectedText,
      SUMMARIZER_CONFIG.summaryType,
      SUMMARIZER_CONFIG.summaryLength,
      targetLanguage || 'en'
    );

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
        setStreamingContent(chunk);
      }
    );
  }, [selectedText, targetLanguage, mode, screenshotData, preferences?.model]);

  // Main analyze handler
  const handleAnalyzeSentence = useCallback(async () => {
    if (!sourceLanguage || !targetLanguage) return;

    // Reset state
    setStreamingContent('');
    setExplanation('');
    setError('');
    setIsLoading(true);

    const agent = preferences?.agent || 'chrome';

    try {
      if (agent === 'chrome') {
        await handleChromeSummarization();
      } else if (agent === 'gemini') {
        await handleGeminiSummarization();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Summarization failed';
      setError(errorMessage);
      setExplanation('');
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  }, [
    sourceLanguage,
    targetLanguage,
    preferences?.agent,
    handleChromeSummarization,
    handleGeminiSummarization,
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

  // Parse Gemini JSON response
  const parsedSummarizerData = useMemo(() => {
    if (!streamingContent) return null;

    try {
      const data: ISummarizerData = JSON.parse(streamingContent);
      return data;
    } catch {
      return null; // JSON incomplete during streaming
    }
  }, [streamingContent]);

  // Determine display content based on agent
  const displayContent = useMemo(() => {
    if (preferences?.agent === 'gemini') {
      return parsedSummarizerData?.summary || '';
    }
    return explanation;
  }, [preferences?.agent, parsedSummarizerData, explanation]);

  const sanitizedHtml = useSafeMarkdown(displayContent);

  return (
    <span
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#e5e7eb',
        userSelect: 'text',
        cursor: 'text',
        minHeight: '50px'
      }}
      onClick={e => e.stopPropagation()}
    >
      {preferences?.agent === 'gemini' ? (
        <GeminiContent
          isLoading={isLoading}
          error={error}
          parsedSummarizerData={parsedSummarizerData}
          displayContent={displayContent}
          sanitizedHtml={sanitizedHtml}
          isLightTheme={isLightTheme}
        />
      ) : (
        <ChromeContent
          isLoadingSummarizer={isLoadingSummarizer}
          summarizerStatus={summarizerStatus}
          error={error}
          sanitizedHtml={sanitizedHtml}
          isLightTheme={isLightTheme}
        />
      )}
    </span>
  );
};

export default Summarization;
