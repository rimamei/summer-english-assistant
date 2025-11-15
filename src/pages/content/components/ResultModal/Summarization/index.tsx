import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useI18n } from '@/hooks/useI18n';
import { useSummarizer, type SummarizerConfig } from '@/hooks/useSummarizer';
import { useStorage } from '@/hooks/useStorage';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import type { ISummarizerData } from '@/type';
import { generateStream } from '@/services/gemini';
import { createSummarizerPrompt } from '@/prompt/gemini/summarizer';
import { summarizerSchema } from '@/prompt/schema/summarizerSchema';
import type { ContentListUnion } from '@google/genai';
import Skeleton from '../../Skeleton';

const Summarization = () => {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { isLightTheme, sourceLanguage, targetLanguage, preferences } = useStorage();
  const { handleSummarizeStreaming, isLoading, summarizerStatus } = useSummarizer();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText, mode, screenshotData },
  } = useExtension();

  const handleAnalyzeSentence = useCallback(async () => {
    if (sourceLanguage && targetLanguage) {
      // Reset content at the start
      setStreamingContent('');
      setExplanation('');
      setError('');
      setIsAnalyzing(true);

      const agent = preferences?.agent || 'chrome';

      try {
        if (agent === 'chrome') {
          const config: SummarizerConfig = {
            expectedInputLanguages: [sourceLanguage || 'en'],
            expectedContextLanguages: [targetLanguage || 'en'],
            format: 'markdown',
            length: 'medium',
            outputLanguage: targetLanguage || 'en',
            type: 'key-points',
          };

          const result = handleSummarizeStreaming(selectedText, config);

          let text = '';
          for await (const chunk of result) {
            text += chunk;
          }

          setExplanation(text || '');
        } else if (agent === 'gemini') {
          const config = {
            temperature: 0.3,
            maxOutputTokens: 1536,
            responseMimeType: 'application/json',
            responseSchema: summarizerSchema,
          };

          const prompt = createSummarizerPrompt(
            selectedText,
            'Keypoints',
            'medium',
            targetLanguage
          );

          let contents: ContentListUnion = [
            {
              role: 'user',
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
              model: preferences?.model ?? 'gemini-2.5-flash',
              contents,
              config,
            },
            chunk => {
              setStreamingContent(chunk);
            }
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Summarization failed';
        setError(errorMessage);
        setExplanation('');
        setStreamingContent('');
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [
    handleSummarizeStreaming,
    mode,
    preferences?.agent,
    preferences?.model,
    screenshotData,
    selectedText,
    sourceLanguage,
    targetLanguage,
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
      handleAnalyzeSentence();
    }
  }, [
    handleAnalyzeSentence,
    mode,
    preferences,
    screenshotData,
    selectedText,
    sourceLanguage,
    targetLanguage,
  ]);

  // Parse the JSON and extract the summary content for Gemini
  const parsedSummarizerData = useMemo(() => {
    if (!streamingContent) return null;

    try {
      const data: ISummarizerData = JSON.parse(streamingContent);
      return data;
    } catch {
      // JSON is incomplete during streaming, return null
      return null;
    }
  }, [streamingContent]);

  // Determine which content to display
  const displayContent = useMemo(() => {
    if (preferences?.agent === 'gemini') {
      return parsedSummarizerData?.summary || '';
    }
    return explanation;
  }, [preferences, parsedSummarizerData, explanation]);

  const sanitizedHtml = useSafeMarkdown(displayContent);

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
      {preferences?.agent === 'gemini' ? (
        // Gemini agent rendering
        isAnalyzing && !parsedSummarizerData ? (
          <>
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} width="100%" height="1em" isLightTheme={isLightTheme} />
              ))}
          </>
        ) : error ? (
          <span style={{ color: '#ef4444' }}>{error}</span>
        ) : parsedSummarizerData && displayContent ? (
          <span
            dangerouslySetInnerHTML={{
              __html: sanitizedHtml,
            }}
          />
        ) : (
          <span style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>
            {t('no_explanation_available')}
          </span>
        )
      ) : // Chrome agent rendering
      isLoading ? (
        summarizerStatus.status === 'downloading' ? (
          <div style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>
            <div style={{ marginBottom: '8px' }}>
              {t('downloading')} {summarizerStatus.progress || 0}%
            </div>
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: isLightTheme ? '#e5e7eb' : '#4b5563',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${summarizerStatus.progress || 0}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ) : (
          <span style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>
            {t('loading')}
            <LoadingDots />
          </span>
        )
      ) : error || summarizerStatus.status === 'error' ? (
        <span style={{ color: '#ef4444' }}>
          {error || summarizerStatus.error || 'Summarization failed'}
        </span>
      ) : (
        <span
          dangerouslySetInnerHTML={{
            __html: sanitizedHtml || '',
          }}
        />
      )}
    </span>
  );
};

export default Summarization;
