import { useEffect, useState, useRef, useCallback } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import type { TPronunciationState } from '@/type/pronunciation';
import { useI18n } from '@/hooks/useI18n';
import { usePronunciation } from '@/hooks/usePronunciation';

const Pronunciation = () => {
  const { t } = useI18n();
  const [data, setData] = useState<TPronunciationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { settingsData, sourceLanguage, targetLanguage, isLightTheme } =
    useStorage();
  const { analyzeWord, pronunciationStatus, isLoading } = usePronunciation();
  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const handlePronunciation = useCallback(async () => {
    try {
      const result = await analyzeWord({
        word: selectedText,
        sourceLanguage: sourceLanguage!,
        targetLanguage: targetLanguage!,
      });

      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, [analyzeWord, selectedText, sourceLanguage, targetLanguage]);

  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      sourceLanguage &&
      targetLanguage
    ) {
      lastAnalyzedRef.current = selectedText;
      handlePronunciation();
    }
  }, [handlePronunciation, selectedText, sourceLanguage, targetLanguage]);

  const accent = settingsData?.accent === 'british' ? 'uk' : 'us';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '8px',
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
              color: isLightTheme ? '#374151' : '',
              userSelect: 'text',
              cursor: 'text',
              lineHeight: '1.6',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading || !data ? (
              <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                {t('loading')}
                <LoadingDots />
              </span>
            ) : error || pronunciationStatus.status === 'error' ? (
              <div>
                <span style={{ color: '#ef4444' }}>
                  {error || pronunciationStatus.error || t('something_went_wrong')}
                </span>
              </div>
            ) : (
              <div>
                <span style={{ ...classes.smallText, fontWeight: 'normal' }}>
                  <b>{data.pronunciation?.[accent] || 'N/A'}</b>
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <span
                    style={{
                      ...classes.smallText,
                      fontWeight: 'normal',
                      color: isLightTheme ? '#6b7280' : '#9ca3af',
                    }}
                  >
                    <b>{t('definition')}</b>
                  </span>
                  <span
                    style={{
                      ...classes.smallText,
                      fontWeight: 'normal',
                      color: isLightTheme ? '#6b7280' : '#9ca3af',
                    }}
                  >
                    {data.definition || 'N/A'}
                  </span>
                </div>
                {data.synonyms && data.synonyms.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      marginTop: '8px',
                    }}
                  >
                    <span
                      style={{
                        ...classes.smallText,
                        fontWeight: 'normal',
                        color: isLightTheme ? '#6b7280' : '#9ca3af',
                      }}
                    >
                      <b>{t('synonyms')}</b>
                    </span>
                    <span
                      style={{
                        ...classes.smallText,
                        fontWeight: 'normal',
                        color: isLightTheme ? '#6b7280' : '#9ca3af',
                      }}
                    >
                      {Array.isArray(data.synonyms)
                        ? data.synonyms.join(', ')
                        : 'N/A'}
                    </span>
                  </div>
                )}
                {data.type && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      marginTop: '8px',
                    }}
                  >
                    <span
                      style={{
                        ...classes.smallText,
                        fontWeight: 'normal',
                        color: isLightTheme ? '#6b7280' : '#9ca3af',
                      }}
                    >
                      <b>
                        {t('level')} / {t('type')}
                      </b>
                    </span>
                    <span
                      style={{
                        ...classes.smallText,
                        fontWeight: 'normal',
                        color: isLightTheme ? '#6b7280' : '#9ca3af',
                      }}
                    >
                      {data.level || 'N/A'} / {data.type || 'N/A'}
                    </span>
                  </div>
                )}
                {data.soundBySound?.[accent] &&
                  data.soundBySound[accent].length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginTop: '8px',
                      }}
                    >
                      <span
                        style={{
                          ...classes.smallText,
                          fontWeight: 'normal',
                          color: isLightTheme ? '#6b7280' : '#9ca3af',
                        }}
                      >
                        <b>{t('sound_by_sound')}</b>
                      </span>
                      <ul
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          listStylePosition: 'inside',
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {data.soundBySound[accent].map((item, index) => (
                          <li key={index}>
                            <span
                              style={{
                                ...classes.smallText,
                                fontWeight: 'normal',
                                color: isLightTheme ? '#6b7280' : '#9ca3af',
                              }}
                            >
                              <b>{item?.symbol}</b> {t('as_in')}{' '}
                              <b>{item?.exampleWord}</b>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pronunciation;
