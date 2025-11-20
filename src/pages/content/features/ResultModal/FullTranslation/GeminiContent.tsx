import { ErrorMessage, LoadingSkeleton } from '@/pages/content/components';

interface GeminiContentProps {
  isLoading: boolean;
  error: string;
  translationText: string;
  sanitizedHtml: string;
  isLightTheme: boolean;
}

const GeminiContent = (props: GeminiContentProps) => {
  const { isLoading, error, translationText, sanitizedHtml, isLightTheme } = props;

  if (isLoading && !translationText) {
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (translationText) {
    return <span dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  }

  return null;
};

export default GeminiContent;
