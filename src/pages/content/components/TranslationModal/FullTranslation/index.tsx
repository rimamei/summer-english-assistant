import { useCallback, useEffect, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/pages/content/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { getTranslation } from '@/service/translator';
import { useI18n } from '@/hooks/useI18n';

const FullTranslation = () => {
  const { t } = useI18n();
  const [translationText, setTranslationText] = useState('');

  const { sourceLanguage, targetLanguage, isLightTheme } = useStorage();

  const {
    state: { selectedText },
  } = useExtension();

  const isLoading = !translationText;

  const handleFullTranslation = useCallback(async () => {
    const result = await getTranslation({
      sourceLanguage,
      targetLanguage,
      text: selectedText,
    });

    setTranslationText(result);
  }, [sourceLanguage, targetLanguage, selectedText]);

  useEffect(() => {
    if (selectedText) {
      handleFullTranslation();
    }
  }, [handleFullTranslation, selectedText]);

  console.log('text', translationText);

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
              ...classes.smallText,
              fontWeight: 'bold',
              color: isLightTheme ? '#6b7280' : '#9ca3af',
            }}
          >
            {t('translation_label')}
          </span>
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
            ) : (
              translationText || t('no_translation_available')
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FullTranslation;
