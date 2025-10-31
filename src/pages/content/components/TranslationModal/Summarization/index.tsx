import { useCallback, useEffect, useRef, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useExtension } from '@/pages/content/hooks/useContext';
import { renderMarkdown } from '@/pages/content/utils/renderMarkdown';
import { useI18n } from '@/hooks/useI18n';
import { useSummarizer, type SummarizerConfig } from '@/hooks/useSummarizer';
import { useStorage } from '@/hooks/useStorage';

const Summarization = () => {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState('');

  const { isLightTheme, sourceLanguage, targetLanguage } = useStorage();
  const { handleSummarizeStreaming } = useSummarizer();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const isLoading = !explanation;

  const handleAnalyzeSentence = useCallback(async () => {
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

    setExplanation(text);
  }, [handleSummarizeStreaming, selectedText, sourceLanguage, targetLanguage]);

  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      targetLanguage &&
      sourceLanguage
    ) {
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
                  __html: renderMarkdown(
                    explanation || t('no_summary_available')
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

export default Summarization;
