import { useI18n } from '@/hooks/useI18n';
import { ErrorMessage, LoadingSkeleton, NoContentMessage } from '@/pages/content/components';

interface GeminiContentProps {
  isLoading: boolean;
  error: string | null;
  sanitizeHtml: string;
  isLightTheme: boolean;
}

const GeminiContent = (props: GeminiContentProps) => {
  const { isLoading, error, sanitizeHtml, isLightTheme } = props;

  const { t } = useI18n();

  if (isLoading) {
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (sanitizeHtml) {
    return (
      <span
        style={{
          listStylePosition: 'outside',
        }}
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml,
        }}
      />
    );
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default GeminiContent;
