import { useI18n } from '@/hooks/useI18n';
import { ErrorMessage, LoadingSkeleton, NoContentMessage } from '@/pages/content/components';

interface GeminiContentProps {
  isLoading: boolean;
  error: string | null;
  parsedSummarizerData: {
    summary: string;
  } | null;
  displayContent: string;
  sanitizedHtml: string;
  isLightTheme: boolean;
}

const GeminiContent = (props: GeminiContentProps) => {
  const { isLoading, error, parsedSummarizerData, displayContent, sanitizedHtml, isLightTheme } =
    props;

  const { t } = useI18n();

  if (isLoading && !parsedSummarizerData) {
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (parsedSummarizerData && displayContent) {
    return <span dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default GeminiContent;
