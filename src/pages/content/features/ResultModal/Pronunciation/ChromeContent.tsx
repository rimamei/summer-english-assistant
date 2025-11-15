import { useI18n } from '@/hooks/useI18n';
import type { PronunciationStatusItem } from '@/hooks/usePronunciation';
import type { TPronunciationState } from '@/type/pronunciation';
import { DownloadProgress, ErrorMessage, LoadingSkeleton } from '@/pages/content/components';
import PronunciationDisplay from './PronunciationDisplay';

interface ChromeContentProps {
  isLoading: boolean;
  pronunciationStatus: PronunciationStatusItem;
  error: string;
  data: TPronunciationState | null;
  accent: 'uk' | 'us';
  onSpeak: () => void;
  isLightTheme: boolean;
}

const ChromeContent = (props: ChromeContentProps) => {
  const { isLoading, pronunciationStatus, error, data, accent, onSpeak, isLightTheme } = props;

  const { t } = useI18n();

  if (isLoading || !data) {
    if (pronunciationStatus.status === 'downloading') {
      return (
        <DownloadProgress
          progress={pronunciationStatus.progress || 0}
          isLightTheme={isLightTheme}
          downloadingText={t('downloading')}
        />
      );
    }
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error || pronunciationStatus.status === 'error') {
    const errorMsg = error || pronunciationStatus.error || t('something_went_wrong');
    return <ErrorMessage message={errorMsg} />;
  }

  return (
    <PronunciationDisplay
      data={data}
      accent={accent}
      onSpeak={onSpeak}
      isLightTheme={isLightTheme}
      t={t}
    />
  );
};

export default ChromeContent;
