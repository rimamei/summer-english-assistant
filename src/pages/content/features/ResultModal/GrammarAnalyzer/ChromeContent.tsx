import { useI18n } from '@/hooks/useI18n';
import type { GrammarStatusItem } from '@/hooks/useGrammar';
import {
  DownloadProgress,
  ErrorMessage,
  LoadingSkeleton,
  NoContentMessage,
} from '@/pages/content/components';

interface ChromeContentProps {
  isLoadingGrammar: boolean;
  grammarStatus: GrammarStatusItem;
  error: string;
  sanitizeHtml: string;
  isLightTheme: boolean;
}

const ChromeContent = (props: ChromeContentProps) => {
  const { isLoadingGrammar, grammarStatus, error, sanitizeHtml, isLightTheme } = props;

  const { t } = useI18n();

  if (isLoadingGrammar && !sanitizeHtml) {
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

  if (sanitizeHtml) {
    return (
      <span
        style={{
          listStylePosition: 'outside',
        }}
        className="result-sanitized"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml || '' }}
      />
    );
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default ChromeContent;
