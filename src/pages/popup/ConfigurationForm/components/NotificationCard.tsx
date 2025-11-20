import { InfoIcon } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import type { SummarizerStatusItem } from '@/hooks/useSummarizer';

interface NotificationCardProps {
  status: SummarizerStatusItem;
  error?: string;
}

const NotificationCard = ({ status, error }: NotificationCardProps) => {
  const { t } = useI18n();

  const isError = status.status === 'error' || error;
  const isDownloading = status.status === 'downloading';

  const colorClasses = isError
    ? 'border-red-200 bg-red-50 dark:bg-red-900 dark:border-red-700'
    : isDownloading
      ? 'border-blue-200 bg-blue-50 dark:bg-blue-900 dark:border-blue-700'
      : 'border-green-200 bg-green-50 dark:bg-green-900 dark:border-green-700';

  const iconClasses = isError
    ? 'text-red-500 dark:text-red-400'
    : 'text-green-500 dark:text-green-400';

  const textClasses = isError
    ? 'text-red-800 dark:text-red-100'
    : isDownloading
      ? 'text-blue-800 dark:text-blue-100'
      : 'text-green-800 dark:text-green-100';

  return (
    <div
      className={`w-full flex items-center gap-3 min-h-12 px-4 py-3 mb-6 rounded-lg shadow-sm border ${colorClasses}`}
      style={{ fontWeight: 500 }}
    >
      {isDownloading ? (
        <div className="h-5 w-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <InfoIcon className={`w-5 h-5 ${iconClasses}`} />
      )}
      <span className={textClasses}>
        {isError
          ? status.error || error
          : isDownloading
            ? `${t('api_downloading')}${
                typeof status.progress === 'number' ? ` ${Math.round(status.progress)}%` : ''
              }`
            : t('api_ready')}
      </span>
    </div>
  );
};

export default NotificationCard;
