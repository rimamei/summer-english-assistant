import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import type { TPronunciationState } from '@/type/pronunciation';
import { useI18n } from '@/hooks/useI18n';
import { usePronunciation } from '@/hooks/usePronunciation';
import { generateStream } from '@/services/gemini';
import { createPronunciationPrompt } from '@/prompt/gemini/pronunciation';
import { pronunciationSchema } from '@/prompt/schema/pronunciationSchema';

const Pronunciation = () => {
  const { t } = useI18n();
  const [data, setData] = useState<TPronunciationState | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { settingsData, sourceLanguage, targetLanguage, isLightTheme, preferences } =
    useStorage();
  const { analyzeWord, pronunciationStatus, isLoading } = usePronunciation();
  const lastAnalyzedRef = useRef<string>('');

  const {
    state: { selectedText },
  } = useExtension();

  const handlePronunciation = useCallback(async () => {
    if (sourceLanguage && targetLanguage) {
      // Reset content at the start
      setStreamingContent('');
      setData(null);
      setError(null);
      setIsAnalyzing(true);

      try {
        if (preferences?.agent === 'chrome') {
          const result = await analyzeWord({
            word: selectedText,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
          });

          setData(result);
        } else if (preferences?.agent === 'gemini' && preferences.model) {
          const config = {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: pronunciationSchema,
          };

          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: createPronunciationPrompt(
                    selectedText,
                    sourceLanguage,
                    targetLanguage
                  ),
                },
              ],
            },
          ];

          await generateStream(
            {
              model: preferences.model,
              contents,
              config,
            },
            (chunk) => {
              setStreamingContent(chunk);
            }
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [analyzeWord, preferences, selectedText, sourceLanguage, targetLanguage]);
  
  useEffect(() => {
    if (
      selectedText &&
      selectedText !== lastAnalyzedRef.current &&
      sourceLanguage &&
      targetLanguage &&
      preferences
    ) {
      lastAnalyzedRef.current = selectedText;
      handlePronunciation();
    }
  }, [handlePronunciation, preferences, selectedText, sourceLanguage, targetLanguage]);

  // Parse the JSON and extract the pronunciation data for Gemini
  const parsedPronunciationData = useMemo(() => {
    if (!streamingContent) return null;

    try {
      const parsedData: TPronunciationState = JSON.parse(streamingContent);
      return parsedData;
    } catch {
      // JSON is incomplete during streaming, return null
      return null;
    }
  }, [streamingContent]);

  // Determine which data to display
  const displayData = useMemo(() => {
    if (preferences?.agent === 'gemini') {
      return parsedPronunciationData;
    }
    return data;
  }, [preferences, parsedPronunciationData, data]);

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
            {preferences?.agent === 'gemini' ? (
              // Gemini agent rendering
              isAnalyzing && !parsedPronunciationData ? (
                <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                  {t('loading')}
                  <LoadingDots />
                </span>
              ) : error ? (
                <span style={{ color: '#ef4444' }}>{error}</span>
              ) : displayData ? (
                <div>
                  <span style={{ ...classes.smallText, fontWeight: 'normal' }}>
                    <b>{displayData.pronunciation?.[accent] || 'N/A'}</b>
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
                      {displayData.definition || 'N/A'}
                    </span>
                  </div>
                  {displayData.synonyms && displayData.synonyms.length > 0 && (
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
                        {Array.isArray(displayData.synonyms)
                          ? displayData.synonyms.join(', ')
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                  {displayData.type && (
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
                        {displayData.level || 'N/A'} / {displayData.type || 'N/A'}
                      </span>
                    </div>
                  )}
                  {displayData.soundBySound?.[accent] &&
                    displayData.soundBySound[accent].length > 0 && (
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
                          {displayData.soundBySound[accent].map((item, index) => (
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
              ) : (
                <span style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}>
                  {t('no_explanation_available')}
                </span>
              )
            ) : (
              // Chrome agent rendering
              isLoading || !data ? (
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
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pronunciation;
