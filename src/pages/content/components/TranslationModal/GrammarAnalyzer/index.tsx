import { useCallback, useEffect, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/pages/content/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { analyzeSentence } from '@/pages/content/prompt/grammar/grammarPrompt';
import { renderMarkdown } from '@/pages/content/utils/renderMarkdown';
import { useI18n } from '@/hooks/useI18n';

const GrammarAnalyzer = () => {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState({
    isCorrect: true,
    details: '',
    correctedSentence: '',
  });

  const { sourceLanguage, targetLanguage, isLightTheme } = useStorage();

  const {
    state: { selectedText },
  } = useExtension();
  
  const isLoading = !explanation.details;

  const handleAnalyzeSentence = useCallback(async () => {
    const result = await analyzeSentence(
      sourceLanguage,
      targetLanguage,
      selectedText
    );

    setExplanation({
      isCorrect: result.isCorrect,
      details: result?.explanation || t('no_explanation_available'),
      correctedSentence: result?.correctedSentence ?? '',
    });
  }, [selectedText, sourceLanguage, t, targetLanguage]);

  useEffect(() => {
    if (selectedText) {
      handleAnalyzeSentence();
    }
  }, [handleAnalyzeSentence, selectedText]);

  return (
    <div>
      <div
        style={{
          marginBottom: '12px',
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
