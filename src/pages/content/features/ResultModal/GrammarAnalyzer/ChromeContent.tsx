import { useI18n } from '@/hooks/useI18n';
import type { GrammarStatusItem } from '@/hooks/useGrammar';
import { DownloadProgress, ErrorMessage, LoadingSkeleton } from '@/pages/content/components';

interface ChromeContentProps {
  isLoadingGrammar: boolean;
  grammarStatus: GrammarStatusItem;
  error: string;
  sanitizedHtml: string;
  isLightTheme: boolean;
}

const ChromeContent = (props: ChromeContentProps) => {
  const { isLoadingGrammar, grammarStatus, error, sanitizedHtml, isLightTheme } = props;

  const { t } = useI18n();

  if (isLoadingGrammar) {
    if (grammarStatus.status === 'downloading') {
      return (
        <DownloadProgress
          progress={grammarStatus.progress || 0}
          isLightTheme={isLightTheme}
          downloadingText={t('downloading')}
        />
      );
    }
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error || grammarStatus.status === 'error') {
    const errorMsg = error || grammarStatus.error || 'Grammar analysis failed';
    return <ErrorMessage message={errorMsg} />;
  }

  return (
    <span
      style={{
        listStylePosition: 'outside',
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml || '' }}
    />
  );
};

export default ChromeContent;
