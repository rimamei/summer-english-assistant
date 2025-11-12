import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import type { TPronunciationState } from '@/type/pronunciation';
import { useI18n } from '@/hooks/useI18n';
import { usePronunciation } from '@/hooks/usePronunciation';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { generateStream } from '@/services/gemini';
import { createPronunciationPrompt } from '@/prompt/gemini/pronunciation';
import { pronunciationSchema } from '@/prompt/schema/pronunciationSchema';
import PronunciationDisplay from './PronunciationDisplay';
import type { ContentListUnion } from '@google/genai';

// Main Component
const Pronunciation = () => {
  const { t } = useI18n();
  const [data, setData] = useState<TPronunciationState | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    settingsData,
    sourceLanguage,
    targetLanguage,
    isLightTheme,
    preferences,
  } = useStorage();
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
    rate: 0.9,
    pitch: 1,
    volume: 1,
  });

  // Fetch pronunciation data
  const handlePronunciation = useCallback(async () => {
    if (!sourceLanguage || !targetLanguage) return;

    setStreamingContent('');
    setData(null);
    setError(null);
    setIsAnalyzing(true);

    const agent = preferences?.agent;

    try {
      if (agent === 'chrome') {
        const result = await analyzeWord({
          word: selectedText,
          sourceLanguage,
          targetLanguage,
        });
        setData(result);
      } else if (agent === 'gemini' && preferences?.model) {
        const prompt = createPronunciationPrompt(
          selectedText,
          sourceLanguage,
          targetLanguage
        );

        let contents: ContentListUnion = [
          {
            role: 'user' as const,
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ];

        if (mode === 'screenshot') {
          // Convert base64 image to the format Gemini expects
          const base64Data = screenshotData?.split(',')[1];
          const mimeType = screenshotData?.split(';')[0].split(':')[1];
          contents = [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: prompt },
          ];
        }

        await generateStream(
          {
            model: preferences.model,
            contents,
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema: pronunciationSchema,
            },
          },
          (chunk) => setStreamingContent(chunk)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeWord, mode, preferences, screenshotData, selectedText, sourceLanguage, targetLanguage]);

  useEffect(() => {
     const highlightMode =
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      mode === 'highlight';
    const screenshotMode = screenshotData && mode === 'screenshot';

    if ((highlightMode || screenshotMode) && sourceLanguage && targetLanguage) {
      lastAnalyzedRef.current = selectedText;
      handlePronunciation();
    }
  }, [handlePronunciation, mode, preferences, screenshotData, selectedText, sourceLanguage, targetLanguage]);

  // Parse streamed JSON for Gemini
  const parsedGeminiData = useMemo(() => {
    if (!streamingContent) return null;
    try {
      return JSON.parse(streamingContent) as TPronunciationState;
    } catch {
      return null;
    }
  }, [streamingContent]);

  // Determine display data
  const displayData = preferences?.agent === 'gemini' ? parsedGeminiData : data;

  // Render loading state
  const isLoadingState =
    preferences?.agent === 'gemini'
      ? isAnalyzing && !parsedGeminiData
      : isLoading || !data;

  // Render error state
  const errorState =
    preferences?.agent === 'gemini'
      ? error
      : error ||
        pronunciationStatus.error ||
        (pronunciationStatus.status === 'error' && t('something_went_wrong'));

  return (
    <div
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#e5e7eb',
        userSelect: 'text',
        cursor: 'text',
        lineHeight: '1.6',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isLoadingState ? (
        <span style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>
          {t('loading')}
          <LoadingDots />
        </span>
      ) : errorState ? (
        <span style={{ color: '#ef4444' }}>{errorState}</span>
      ) : displayData ? (
        <PronunciationDisplay
          data={displayData}
          accent={accent}
          onSpeak={speak}
          isLightTheme={isLightTheme}
          t={t}
        />
      ) : (
        <span style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>
          {t('no_explanation_available')}
        </span>
      )}
    </div>
  );
};

export default Pronunciation;
