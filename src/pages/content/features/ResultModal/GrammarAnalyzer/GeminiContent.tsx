import { useI18n } from '@/hooks/useI18n';
import { ErrorMessage, LoadingSkeleton, NoContentMessage } from '@/pages/content/components';
import type { IGrammarData } from '@/type';

interface GeminiContentProps {
  isLoading: boolean;
  error: string | null;
  parsedGrammarData: IGrammarData | null;
  displayContent: string;
  sanitizedHtml: string;
  isLightTheme: boolean;
}

const GeminiContent = (props: GeminiContentProps) => {
  const { isLoading, error, parsedGrammarData, displayContent, sanitizedHtml, isLightTheme } =
    props;

  const { t } = useI18n();

  if (isLoading && !parsedGrammarData) {
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (parsedGrammarData && displayContent) {
    return (
      <span
        style={{
          listStylePosition: 'outside',
        }}
        dangerouslySetInnerHTML={{
          __html: sanitizedHtml,
        }}
      />
    );
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default GeminiContent;
