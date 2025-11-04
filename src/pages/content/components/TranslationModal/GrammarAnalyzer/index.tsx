import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useI18n } from '@/hooks/useI18n';
import { useGrammar } from '@/hooks/useGrammar';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';
import type { IGrammarData } from '@/type';

const GrammarAnalyzer = () => {
  const { t } = useI18n();
  const [streamingContent, setStreamingContent] = useState<string>('');

  const { sourceLanguage, targetLanguage, isLightTheme } = useStorage();
  const { analyzeSentence, isLoading } = useGrammar();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const handleAnalyzeSentence = useCallback(async () => {
    if (sourceLanguage && targetLanguage) {
      // Reset streaming content at the start
      setStreamingContent('');

      await analyzeSentence({
        sentence: selectedText,
        sourceLanguage,
        targetLanguage,
        onChunk: (chunk) => {
          // Update streaming content as chunks arrive
          setStreamingContent(chunk);
        },
      });
    }
  }, [analyzeSentence, selectedText, sourceLanguage, targetLanguage]);

  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      sourceLanguage &&
      targetLanguage
    ) {
      lastAnalyzedRef.current = selectedText;
      handleAnalyzeSentence();
    }
  }, [handleAnalyzeSentence, selectedText, sourceLanguage, targetLanguage]);

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

    // Add the details (grammar explanation)
    if (parsedGrammarData.details) {
      content += parsedGrammarData.details;
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
            {isLoading && !parsedGrammarData ? (
              <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                {t('loading')}
                <LoadingDots />
              </span>
            ) : parsedGrammarData && displayContent ? (
              <span
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
