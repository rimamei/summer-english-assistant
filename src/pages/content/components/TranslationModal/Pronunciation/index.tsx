import { useEffect, useState, useRef } from 'react';
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
  const { analyzeWord, promptStatus, isLoading } = usePronunciation();

  const {
    state: { selectedText },
  } = useExtension();

  // Track what we've analyzed
  const lastAnalyzedRef = useRef<string>('');
  const isAnalyzingRef = useRef(false);

  useEffect(() => {
    // Only analyze if we have text and haven't analyzed this exact text yet
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      !isAnalyzingRef.current
    ) {
      isAnalyzingRef.current = true;
      lastAnalyzedRef.current = selectedText;
      setError(null);
      setData(null);

      console.log('Starting analysis for:', selectedText);

      const analyzeSentence = async () => {
        try {
          const result = await analyzeWord({
            word: selectedText,
            sourceLanguage,
            targetLanguage,
          });

          setData(result);
        } catch (err) {
          console.error('Analysis failed:', err);
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
        } finally {
          isAnalyzingRef.current = false;
        }
      };

      analyzeSentence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedText, sourceLanguage, targetLanguage]);

  const accent = settingsData?.accent === 'british' ? 'uk' : 'us';

  console.log('promptStatus:', promptStatus);
  console.log('isLoading:', isLoading);
  console.log('data:', data);

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
            ) : error || promptStatus.status === 'error' ? (
              <div>
                <span style={{ color: '#ef4444' }}>
                  {error || promptStatus.error || t('something_went_wrong')}
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
