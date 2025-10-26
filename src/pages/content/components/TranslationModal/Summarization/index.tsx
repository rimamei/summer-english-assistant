import { useCallback, useEffect, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/pages/content/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { renderMarkdown } from '@/pages/content/utils/renderMarkdown';
import { getSummary } from '@/service/summarizer';

const Summarization = () => {
  const [explanation, setExplanation] = useState('');

  const { sourceLanguage, targetLanguage } = useStorage();

  const { state } = useExtension();
  const isLoading = !explanation;

  const selectedText = state.selectionInfo?.text || '';

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
        <div style={classes.grammarContainer}>
          <div
            style={{
              ...classes.contentText,
              userSelect: 'text',
              cursor: 'text',
              lineHeight: '1.6',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <span style={{ color: '#6b7280' }}>
                Loading
                <LoadingDots />
              </span>
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(explanation || 'No summary available'),
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
