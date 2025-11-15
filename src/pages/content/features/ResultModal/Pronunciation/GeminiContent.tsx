import { useI18n } from '@/hooks/useI18n';
import type { TPronunciationState } from '@/type/pronunciation';
import { ErrorMessage, LoadingSkeleton, NoContentMessage } from '@/pages/content/components';
import PronunciationDisplay from './PronunciationDisplay';

interface GeminiContentProps {
  isAnalyzing: boolean;
  error: string | null;
  parsedGeminiData: TPronunciationState | null;
  accent: 'uk' | 'us';
  onSpeak: () => void;
  isLightTheme: boolean;
}

const GeminiContent = (props: GeminiContentProps) => {
  const { isAnalyzing, error, parsedGeminiData, accent, onSpeak, isLightTheme } = props;

  const { t } = useI18n();

  if (isAnalyzing && !parsedGeminiData) {
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (parsedGeminiData) {
    return (
      <PronunciationDisplay
        data={parsedGeminiData}
        accent={accent}
        onSpeak={onSpeak}
        isLightTheme={isLightTheme}
        t={t}
      />
    );
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default GeminiContent;
