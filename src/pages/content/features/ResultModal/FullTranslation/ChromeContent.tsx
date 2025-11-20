import { useI18n } from '@/hooks/useI18n';
import type { TranslatorStatusItem } from '@/hooks/useTranslator';
import {
  DownloadProgress,
  ErrorMessage,
  LoadingSkeleton,
  NoContentMessage,
} from '@/pages/content/components';

interface ChromeContentProps {
  isLoadingTranslator: boolean;
  translatorStatus: TranslatorStatusItem;
  error: string;
  sanitizedHtml: string;
  isLightTheme: boolean;
}

const ChromeContent = (props: ChromeContentProps) => {
  const { isLoadingTranslator, translatorStatus, error, sanitizedHtml, isLightTheme } = props;

  const { t } = useI18n();

  if (isLoadingTranslator) {
    if (translatorStatus.status === 'downloading') {
      return (
        <DownloadProgress
          progress={translatorStatus.progress || 0}
          isLightTheme={isLightTheme}
          downloadingText={t('downloading')}
        />
      );
    }
    return <LoadingSkeleton isLightTheme={isLightTheme} />;
  }

  if (error || translatorStatus.status === 'error') {
    const errorMsg = error || translatorStatus.error || 'Translation failed';
    return <ErrorMessage message={errorMsg} />;
  }

  if (sanitizedHtml) {
    return (
      <span
        style={{
          listStylePosition: 'outside',
        }}
        className="result-sanitized"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml || '' }}
      />
    );
  }

  return <NoContentMessage message={t('no_explanation_available')} isLightTheme={isLightTheme} />;
};

export default ChromeContent;
