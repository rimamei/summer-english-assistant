import { useCallback, useEffect, useRef, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { useI18n } from '@/hooks/useI18n';
import { useTranslator } from '@/hooks/useTranslator';
import { renderMarkdown } from '@/pages/content/utils/renderMarkdown';

const FullTranslation = () => {
  const { t } = useI18n();
  const [translationText, setTranslationText] = useState('');
  const { sourceLanguage, targetLanguage } = useStorage();

  const [error, setError] = useState<string>('');

  const { isLightTheme } = useStorage();
  const { handleTranslateStreaming, isLoading, translatorStatus } =
    useTranslator();
  const {
    state: { selectedText },
  } = useExtension();

  const lastAnalyzedRef = useRef<string>('');

  const handleFullTranslation = useCallback(async () => {
    try {
      setError('');
      setTranslationText('');

      const stream = await handleTranslateStreaming(
        selectedText,
        sourceLanguage!,
        targetLanguage!
      );

      let result = '';
      for await (const chunk of stream) {
        result += chunk;
      }

      setTranslationText(result || '');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      setTranslationText('');
    }
  }, [handleTranslateStreaming, selectedText, sourceLanguage, targetLanguage]);

  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      sourceLanguage &&
      targetLanguage
    ) {
      lastAnalyzedRef.current = selectedText;
      handleFullTranslation();
    }
  }, [handleFullTranslation, selectedText, sourceLanguage, targetLanguage]);

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
            ) : error || translatorStatus.status === 'error' ? (
              <span style={{ color: '#ef4444' }}>
                {error || translatorStatus.error || 'Translation failed'}
              </span>
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(
                    translationText || t('no_translation_available')
                  ),
                }}
              />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FullTranslation;
