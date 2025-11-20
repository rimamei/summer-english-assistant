import { useI18n } from '@/hooks/useI18n';
import { ErrorMessage, LoadingSkeleton, NoContentMessage } from '@/pages/content/components';

interface GeminiContentProps {
  isLoading: boolean;
  error: string;
  translationText: string;
  sanitizedHtml: string;
  isLightTheme: boolean;
}

const GeminiContent = (props: GeminiContentProps) => {
  const { isLoading, error, translationText, sanitizedHtml, isLightTheme } = props;
  
  const { t } = useI18n();
  
  if (isLoading && !translationText) {
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (translationText) {
    return (
      <span
        style={{
          listStylePosition: 'outside',
        }}
        className="result-sanitized"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default GeminiContent;
