import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useI18n } from '@/hooks/useI18n';
import { useGrammar } from '@/hooks/useGrammar';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import type { IGrammarData } from '@/type';
import { generateStream } from '@/services/gemini';
import { createGrammarPrompt } from '@/prompt/gemini/grammar';
import { grammarSchema } from '@/prompt/schema/grammarSchema';
import type { ContentListUnion } from '@google/genai';

const GrammarAnalyzer = () => {
  const { t } = useI18n();
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');

  const { sourceLanguage, targetLanguage, isLightTheme, preferences } = useStorage();
  const { analyzeSentence } = useGrammar();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText, mode, screenshotData },
  } = useExtension();

  const handleAnalyzeSentence = useCallback(async () => {
    if (sourceLanguage && targetLanguage) {
      // Reset streaming content and error at the start
      setStreamingContent('');
      setError('');
      setIsAnalyzing(true);

      const agent = preferences?.agent;

      try {
        if (agent === 'chrome') {
          await analyzeSentence({
            sentence: selectedText,
            sourceLanguage,
            targetLanguage,
            onChunk: chunk => {
              setStreamingContent(chunk);
            },
          });
        } else if (agent === 'gemini' && preferences?.model) {
          const config = {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: grammarSchema,
          };

          const prompt = createGrammarPrompt(selectedText, sourceLanguage, targetLanguage);

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
              model: preferences.model,
              contents,
              config,
            },
            chunk => {
              setStreamingContent(chunk);
            }
          );
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to analyze grammar');
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [
    analyzeSentence,
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

    if ((highlightMode || screenshotMode) && sourceLanguage && targetLanguage) {
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

  // Parse the JSON and extract the markdown content
  const parsedGrammarData = useMemo(() => {
    if (!streamingContent) return null;

    try {
      const data: IGrammarData = JSON.parse(streamingContent);
      return data;
    } catch {
      // JSON is incomplete during streaming, return null
      return null;
    }
  }, [streamingContent]);

  // Create the display content from parsed data
  const displayContent = useMemo(() => {
    if (!parsedGrammarData) return '';

    let content = '';

    // Show corrections if the sentence is incorrect
    if (!parsedGrammarData.isCorrect && parsedGrammarData.corrections) {
      const correction = t('correction');
      content += `**${
        correction.charAt(0).toUpperCase() + correction.slice(1)
      }:**\n ${parsedGrammarData.corrections}\n\n`;
    }

    if (parsedGrammarData.details) {
      const explanation = t('explanation');
      content += `**${explanation.charAt(0).toUpperCase() + explanation.slice(1)}:**\n`;
      const details = parsedGrammarData.details
        .replace(/\\n/g, '\n') // Replace literal \n with actual newlines
        .replace(/\n\n+/g, '\n\n'); // Normalize multiple newlines
      content += details;
    }

    return content;
  }, [parsedGrammarData, t]);

  const sanitizedStreamingHtml = useSafeMarkdown(displayContent);

  return (
    <div
      style={{
        ...classes.contentText,
        color: isLightTheme ? '#374151' : '#f3f4f6',
        userSelect: 'text',
        cursor: 'text',
        lineHeight: '1.6',
      }}
      onClick={e => e.stopPropagation()}
    >
      {error ? (
        <span style={{ color: '#ef4444' }}>{error}</span>
      ) : isAnalyzing && !parsedGrammarData ? (
        <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
          {t('loading')}
          <LoadingDots />
        </span>
      ) : parsedGrammarData && displayContent ? (
        <span
          style={{
            listStylePosition: 'outside',
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizedStreamingHtml,
          }}
        />
      ) : (
        <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
          {t('no_explanation_available')}
        </span>
      )}
    </div>
  );
};

export default GrammarAnalyzer;
