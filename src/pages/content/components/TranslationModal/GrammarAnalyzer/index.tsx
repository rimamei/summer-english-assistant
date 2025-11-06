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

const GrammarAnalyzer = () => {
  const { t } = useI18n();
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { sourceLanguage, targetLanguage, isLightTheme, preferences } =
    useStorage();
  const { analyzeSentence } = useGrammar();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const handleAnalyzeSentence = useCallback(async () => {
    if (sourceLanguage && targetLanguage) {
      // Reset streaming content at the start
      setStreamingContent('');
      setIsAnalyzing(true);

      try {
        if (preferences?.agent === 'chrome') {
          await analyzeSentence({
            sentence: selectedText,
            sourceLanguage,
            targetLanguage,
            onChunk: (chunk) => {
              setStreamingContent(chunk);
            },
          });
        } else if (preferences?.agent === 'gemini' && preferences.model) {
          const config = {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: grammarSchema,
          };

          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: createGrammarPrompt(
                    selectedText,
                    sourceLanguage,
                    targetLanguage
                  ),
                },
              ],
            },
          ];

          await generateStream(
            {
              model: preferences.model,
              contents,
              config,
            },
            (chunk) => {
              setStreamingContent(chunk);
            }
          );
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [
    analyzeSentence,
    preferences,
    selectedText,
    sourceLanguage,
    targetLanguage,
  ]);

  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      sourceLanguage &&
      targetLanguage && preferences
    ) {
      lastAnalyzedRef.current = selectedText;
      handleAnalyzeSentence();
    }
  }, [handleAnalyzeSentence, preferences, selectedText, sourceLanguage, targetLanguage]);

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
      content += `**Correction:** ${parsedGrammarData.corrections}\n\n`;
    }

    if (parsedGrammarData.details) {
      const details = parsedGrammarData.details
        .replace(/\\n/g, '\n')  // Replace literal \n with actual newlines
        .replace(/\n\n+/g, '\n\n');  // Normalize multiple newlines
      content += details;
    }

    return content;
  }, [parsedGrammarData]);

  const sanitizedStreamingHtml = useSafeMarkdown(displayContent);

  return (
    <div>
      <div
        style={{
          margin: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            ...classes.grammarContainer,
            backgroundColor: isLightTheme ? '#f3f4f6' : '',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              ...classes.contentText,
              color: isLightTheme ? '#374151' : '#f3f4f6',
              userSelect: 'text',
              cursor: 'text',
              lineHeight: '1.6',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAnalyzing && !parsedGrammarData ? (
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
        </div>
      </div>
    </div>
  );
};

export default GrammarAnalyzer;
