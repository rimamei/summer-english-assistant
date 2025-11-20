import { useI18n } from '@/hooks/useI18n';
import type { SummarizerStatusItem } from '@/hooks/useSummarizer';
import {
  DownloadProgress,
  ErrorMessage,
  LoadingSkeleton,
  NoContentMessage,
} from '@/pages/content/components';

interface ChromeContentProps {
  isLoadingSummarizer: boolean;
  summarizerStatus: SummarizerStatusItem;
  error: string;
  sanitizedHtml: string;
  isLightTheme: boolean;
}

const ChromeContent = (props: ChromeContentProps) => {
  const { isLoadingSummarizer, summarizerStatus, error, sanitizedHtml, isLightTheme } = props;

  const { t } = useI18n();

  if (isLoadingSummarizer) {
    if (summarizerStatus.status === 'downloading') {
      return (
        <DownloadProgress
          progress={summarizerStatus.progress || 0}
          isLightTheme={isLightTheme}
          downloadingText={t('downloading')}
        />
      );
    }
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error || summarizerStatus.status === 'error') {
    const errorMsg = error || summarizerStatus.error || 'Summarization failed';
    return <ErrorMessage message={errorMsg} />;
  }

  if (sanitizedHtml) {
    return <span dangerouslySetInnerHTML={{ __html: sanitizedHtml || '' }} />;
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default ChromeContent;
