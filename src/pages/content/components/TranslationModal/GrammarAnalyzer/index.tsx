import { useCallback, useEffect, useRef, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { renderMarkdown } from '@/pages/content/utils/renderMarkdown';
import { useI18n } from '@/hooks/useI18n';
import { useGrammar } from '@/hooks/useGrammar';
import type { IGrammarData } from '@/type';

const GrammarAnalyzer = () => {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState<IGrammarData>();

  const { sourceLanguage, targetLanguage, isLightTheme } = useStorage();
  const { analyzeSentence } = useGrammar();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const isLoading = !explanation?.details;

  const handleAnalyzeSentence = useCallback(async () => {
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

    console.log('res', result)
  }, [analyzeSentence, selectedText, sourceLanguage, t, targetLanguage]);

  useEffect(() => {
    if (selectedText && selectedText !== lastAnalyzedRef.current) {
      lastAnalyzedRef.current = selectedText;
      handleAnalyzeSentence();
    }
  }, [handleAnalyzeSentence, selectedText, sourceLanguage, targetLanguage]);

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
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(
                    explanation.details || t('no_explanation_available')
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarAnalyzer;
