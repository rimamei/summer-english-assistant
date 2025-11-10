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

const Summarization = () => {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { isLightTheme, sourceLanguage, targetLanguage, preferences } = useStorage();
  const { handleSummarizeStreaming, isLoading, summarizerStatus } =
    useSummarizer();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
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
            responseMimeType: 'application/json',
            responseSchema: summarizerSchema,
          };

          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: createSummarizerPrompt(
                    selectedText,
                    'Keypoints',
                    'medium',
                    targetLanguage
                  ),
                },
              ],
            },
          ];

          await generateStream(
            {
              model: preferences?.model ?? 'gemini-2.5-flash',
              contents,
              config,
            },
            (chunk) => {
              setStreamingContent(chunk);
            }
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Summarization failed';
        setError(errorMessage);
        setExplanation('');
        setStreamingContent('');
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [
    handleSummarizeStreaming,
    preferences,
    selectedText,
    sourceLanguage,
    targetLanguage,
  ]);

  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      targetLanguage &&
      sourceLanguage &&
      preferences
    ) {
      lastAnalyzedRef.current = selectedText;
      handleAnalyzeSentence();
    }
  }, [handleAnalyzeSentence, preferences, selectedText, sourceLanguage, targetLanguage]);

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
    <div
      style={{
        padding: '8px',
      }}
    >
      <div
        style={{
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div
          style={{
            ...classes.translationContainer,
            backgroundColor: isLightTheme ? '#f3f4f6' : '#374151',
          }}
        >
          <span
            style={{
              ...classes.contentText,
              color: isLightTheme ? '#374151' : '#9ca3af',
              userSelect: 'text',
              cursor: 'text',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {preferences?.agent === 'gemini' ? (
              // Gemini agent rendering
              isAnalyzing && !parsedSummarizerData ? (
                <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                  {t('loading')}
                  <LoadingDots />
                </span>
              ) : error ? (
                <span style={{ color: '#ef4444' }}>{error}</span>
              ) : parsedSummarizerData && displayContent ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: sanitizedHtml,
                  }}
                />
              ) : (
                <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                  {t('no_explanation_available')}
                </span>
              )
            ) : (
              // Chrome agent rendering
              isLoading ? (
                summarizerStatus.status === 'downloading' ? (
                  <div style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
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
                  <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
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
              )
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Summarization;
