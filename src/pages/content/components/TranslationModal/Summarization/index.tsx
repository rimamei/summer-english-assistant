import { useCallback, useEffect, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/pages/content/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { renderMarkdown } from '@/pages/content/utils/renderMarkdown';
import { getSummary } from '@/service/summarizer';
import { useI18n } from '@/hooks/useI18n';

const Summarization = () => {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState('');

  const { sourceLanguage, targetLanguage, isLightTheme } = useStorage();

  const {
    state: { selectedText },
  } = useExtension();
  
  const isLoading = !explanation;

  const handleAnalyzeSentence = useCallback(async () => {
    const result = await getSummary({
      sourceLanguage,
      targetLanguage,
      text: selectedText,
    });

    setExplanation(result);
  }, [selectedText, sourceLanguage, targetLanguage]);

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
            backgroundColor: isLightTheme ? '#f3f4f6' : '#374151',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              ...classes.contentText,
              color: isLightTheme ? '#374151' : '',
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
                  __html: renderMarkdown(explanation || t('no_summary_available')),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summarization;
