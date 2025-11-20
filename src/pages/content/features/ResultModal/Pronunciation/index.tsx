import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { classes } from '../style';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import type { TPronunciationState } from '@/type/pronunciation';
import { usePronunciation } from '@/hooks/usePronunciation';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { generateStream } from '@/services/gemini';
import { createPronunciationPrompt } from '@/prompt/gemini/pronunciation';
import { pronunciationSchema } from '@/prompt/schema/pronunciationSchema';
import { createScreenshotContent, createTextContent } from '../../../utils/promptConfig';
import ChromeContent from './ChromeContent';
import GeminiContent from './GeminiContent';
import { PRONUNCIATION_CONFIG } from './constants';

const Pronunciation = () => {
  const [data, setData] = useState<TPronunciationState | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { settingsData, sourceLanguage, targetLanguage, isLightTheme, preferences } = useStorage();
  const { analyzeWord, pronunciationStatus, isLoading } = usePronunciation();
  const lastAnalyzedRef = useRef<string>('');
  const {
    state: { selectedText, mode, screenshotData },
  } = useExtension();

  const accent = settingsData?.accent === 'british' ? 'uk' : 'us';

  // Text-to-speech hook
  const { speak } = useTextToSpeech({
    text: selectedText,
    accent: settingsData?.accent,
    rate: PRONUNCIATION_CONFIG.rate,
    pitch: PRONUNCIATION_CONFIG.pitch,
    volume: PRONUNCIATION_CONFIG.volume,
  });

  // Agent-specific handlers
  const handleChromePronunciation = useCallback(async () => {
    const result = await analyzeWord({
      word: selectedText,
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage: targetLanguage || 'en',
    });
    setData(result);
  }, [analyzeWord, selectedText, sourceLanguage, targetLanguage]);

  const handleGeminiPronunciation = useCallback(async () => {
    const config = {
      temperature: PRONUNCIATION_CONFIG.temperature,
      responseMimeType: 'application/json',
      responseSchema: pronunciationSchema,
    };

    const prompt = createPronunciationPrompt(
      selectedText,
      sourceLanguage || 'en',
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
  }, [selectedText, sourceLanguage, targetLanguage, mode, screenshotData, preferences?.model]);

  // Main analyze handler
  const handlePronunciation = useCallback(async () => {
    if (!sourceLanguage || !targetLanguage) return;

    // Reset state
    setStreamingContent('');
    setData(null);
    setError('');
    setIsAnalyzing(true);

    const agent = preferences?.agent || 'chrome';

    try {
      if (agent === 'chrome') {
        await handleChromePronunciation();
      } else if (agent === 'gemini') {
        await handleGeminiPronunciation();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pronunciation analysis failed';
      setError(errorMessage);
      setData(null);
      setStreamingContent('');
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    sourceLanguage,
    targetLanguage,
    preferences?.agent,
    handleChromePronunciation,
    handleGeminiPronunciation,
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
      handlePronunciation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAnalyze]);

  // Parse streamed JSON for Gemini
  const parsedGeminiData = useMemo(() => {
    if (!streamingContent) return null;
    try {
      return JSON.parse(streamingContent) as TPronunciationState;
    } catch {
      return null;
    }
  }, [streamingContent]);

  return (
    <div
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#e5e7eb',
        userSelect: 'text',
        cursor: 'text',
        lineHeight: '1.6',
        minHeight: '50px'
      }}
      onClick={e => e.stopPropagation()}
    >
      {preferences?.agent === 'gemini' ? (
        <GeminiContent
          isAnalyzing={isAnalyzing}
          error={error}
          parsedGeminiData={parsedGeminiData}
          accent={accent}
          onSpeak={speak}
          isLightTheme={isLightTheme}
        />
      ) : (
        <ChromeContent
          isLoading={isLoading}
          pronunciationStatus={pronunciationStatus}
          error={error}
          data={data}
          accent={accent}
          onSpeak={speak}
          isLightTheme={isLightTheme}
        />
      )}
    </div>
  );
};

export default Pronunciation;
