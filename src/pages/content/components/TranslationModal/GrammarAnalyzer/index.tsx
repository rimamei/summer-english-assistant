import { useCallback, useEffect, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/pages/content/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { analyzeSentence } from '@/pages/content/prompt/grammar/grammarPrompt';
import { renderMarkdown } from '@/pages/content/utils/renderMarkdown';

const GrammarAnalyzer = () => {
  const [explanation, setExplanation] = useState({
    isCorrect: true,
    details: '',
    correctedSentence: '',
  });

  const { sourceLanguage, targetLanguage } = useStorage();

  const { state } = useExtension();
  const isLoading = !explanation.details;

  const { selectedText } = state;

  const handleAnalyzeSentence = useCallback(async () => {
    const result = await analyzeSentence(
      sourceLanguage,
      targetLanguage,
      selectedText
    );

    setExplanation({
      isCorrect: result.isCorrect,
      details: result?.explanation || 'No explanation available',
      correctedSentence: result?.correctedSentence ?? '',
    });
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
                  __html: renderMarkdown(
                    explanation.details || 'No explanation available'
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
