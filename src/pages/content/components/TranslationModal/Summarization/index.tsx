import { useCallback, useEffect, useRef, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useI18n } from '@/hooks/useI18n';
import { useSummarizer, type SummarizerConfig } from '@/hooks/useSummarizer';
import { useStorage } from '@/hooks/useStorage';
import { useSafeMarkdown } from '@/hooks/useSafeMarkdown';

const Summarization = () => {
  const { t } = useI18n();
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string>('');

  const { isLightTheme, sourceLanguage, targetLanguage } = useStorage();
  const { handleSummarizeStreaming, isLoading, summarizerStatus } =
    useSummarizer();

  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const handleAnalyzeSentence = useCallback(async () => {
    try {
      setError('');
      setExplanation('');

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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Summarization failed';
      setError(errorMessage);
      setExplanation('');
    }
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

  const sanitizedHtml = useSafeMarkdown(explanation);

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
            {isLoading ? (
              <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                {t('loading')}
                <LoadingDots />
              </span>
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
        </div>
      </div>
    </div>
  );
};

export default Summarization;
