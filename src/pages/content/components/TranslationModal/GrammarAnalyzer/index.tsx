import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [explanation, setExplanation] = useState<IGrammarData>();

  const { sourceLanguage, targetLanguage, isLightTheme } = useStorage();
  const { analyzeSentence, isLoading } = useGrammar();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const handleAnalyzeSentence = useCallback(async () => {
    if (sourceLanguage && targetLanguage) {
      const result = await analyzeSentence({
        sentence: selectedText,
        sourceLanguage,
        targetLanguage,
      });

      setExplanation({
        isCorrect: result?.isCorrect || true,
        details: result?.details || t('no_explanation_available'),
        corrections: result?.corrections ?? '',
      });
    }
  }, [analyzeSentence, selectedText, sourceLanguage, t, targetLanguage]);

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

  const sanitizedHtml = useSafeMarkdown(explanation?.details || '');

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
            {isLoading ? (
              <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                {t('loading')}
                <LoadingDots />
              </span>
            ) : sanitizedHtml ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: sanitizedHtml,
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
