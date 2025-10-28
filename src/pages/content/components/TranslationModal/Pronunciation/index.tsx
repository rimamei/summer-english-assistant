import { useEffect, useState } from 'react';
import { classes } from '../style';
import LoadingDots from '../../LoadingDots';
import { useStorage } from '@/pages/content/hooks/useStorage';
import { useExtension } from '@/pages/content/hooks/useContext';
import { analyzeWord } from '@/pages/content/prompt/pronunciation/pronunciationPrompt';
import type { TPronunciationState } from '@/type/pronunciation';
import { getTranslation } from '@/service/translator';

const Pronunciation = () => {
  const [data, setData] = useState<TPronunciationState>({
    definition: '',
    level: '',
    pronunciation: {
      uk: '',
      us: '',
    },
    soundBySound: {
      uk: [],
      us: [],
    },
    synonyms: [],
    text: '',
    translation: '',
    type: '',
  });

  const { settingsData, sourceLanguage, targetLanguage, isLightTheme } = useStorage();

  const {
    state: { selectedText },
  } = useExtension();

  const isLoading = !data?.definition;

  useEffect(() => {
    if (selectedText) {
      const analyzeSentence = async () => {
        const result = await analyzeWord(
          sourceLanguage,
          targetLanguage,
          selectedText
        );

        const translation = await getTranslation({
          sourceLanguage,
          targetLanguage,
          text: selectedText,
        });

        setData({ ...result, translation });
      };

      analyzeSentence();
    }
  }, [selectedText, sourceLanguage, targetLanguage]);

  const accent = settingsData?.accent === 'british' ? 'uk' : 'us';

  return (
    <div>
      <div
        style={{
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          ...classes.grammarContainer,
          backgroundColor: isLightTheme ? '#f3f4f6' : '',
          borderRadius: '4px',
        }}>
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
                Loading
                <LoadingDots />
              </span>
            ) : (
              <div>
                <span style={{ ...classes.smallText, fontWeight: 'normal' }}>
                  <b>
                    {data.pronunciation[accent] || 'N/A'} ({data.type || 'N/A'}{' '}
                    / {data.level || 'N/A'})
                  </b>
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ 
                    ...classes.smallText, 
                    fontWeight: 'normal',
                    color: isLightTheme ? '#6b7280' : '#9ca3af',
                  }}>
                    <b>Definition:</b>
                  </span>
                  <span style={{ 
                    ...classes.smallText, 
                    fontWeight: 'normal',
                    color: isLightTheme ? '#6b7280' : '#9ca3af',
                  }}>
                    {data.definition || 'N/A'}
                  </span>
                </div>
                {data.synonyms.length > 0 && (
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
                      <b>Synonyms:</b>
                    </span>
                    <span
                      style={{ 
                        ...classes.smallText, 
                        fontWeight: 'normal',
                        color: isLightTheme ? '#6b7280' : '#9ca3af',
                      }}
                    >
                      {data.synonyms && Array.isArray(data.synonyms)
                        ? data.synonyms.join(', ')
                        : 'N/A'}
                    </span>
                  </div>
                )}
                {data.soundBySound[accent].length > 0 && (
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
                      <b>Sound by Sound:</b>
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
                            <b>{item?.symbol}</b> as in{' '}
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
