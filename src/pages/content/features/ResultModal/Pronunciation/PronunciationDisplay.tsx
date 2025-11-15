import type { useI18n } from '@/lib/i18n';
import type { TPronunciationState } from '@/type/pronunciation';
import SpeakerButton from './Speaker';
import { classes } from '../style';
import InfoSection from './InfoSection';
import SoundBySoundList from './SoundBySoundList';

interface PronunciationDisplayProps {
  data: TPronunciationState;
  accent: 'uk' | 'us';
  onSpeak: () => void;
  isLightTheme: boolean;
  t: ReturnType<typeof useI18n>['t'];
}

const PronunciationDisplay = ({
  data,
  accent,
  onSpeak,
  isLightTheme,
  t,
}: PronunciationDisplayProps) => {
  const hasSynonyms = data.synonyms && data.synonyms.length > 0;
  const hasSoundBySound = data.soundBySound?.[accent]?.length > 0;

  return (
    <div>
      {/* Pronunciation with speaker button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <SpeakerButton onClick={onSpeak} isLightTheme={isLightTheme} />
        <span
          style={{
            ...classes.contentText,
            color: isLightTheme ? '#374151' : '#e5e7eb',
            fontWeight: 'normal',
          }}
        >
          <b>{data.pronunciation?.[accent] || 'N/A'}</b>
        </span>
      </div>

      {/* Definition */}
      <InfoSection
        label={t('definition')}
        value={data.definition || 'N/A'}
        isLightTheme={isLightTheme}
      />

      {/* Synonyms */}
      {hasSynonyms && (
        <InfoSection
          label={t('synonyms')}
          value={Array.isArray(data.synonyms) ? data.synonyms.join(', ') : 'N/A'}
          isLightTheme={isLightTheme}
        />
      )}

      {/* Level and Type */}
      {data.type && (
        <InfoSection
          label={`${t('level')} / ${t('type')}`}
          value={`${data.level || 'N/A'} / ${data.type || 'N/A'}`}
          isLightTheme={isLightTheme}
        />
      )}

      {/* Sound by Sound */}
      {hasSoundBySound && (
        <SoundBySoundList
          sounds={data.soundBySound[accent]}
          label={t('sound_by_sound')}
          asInLabel={t('as_in')}
          isLightTheme={isLightTheme}
        />
      )}
    </div>
  );
};

export default PronunciationDisplay;
