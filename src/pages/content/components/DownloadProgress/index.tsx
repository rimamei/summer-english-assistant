import { classes } from './style';

const DownloadProgress = ({
  progress,
  isLightTheme,
  downloadingText,
}: {
  progress: number;
  isLightTheme: boolean;
  downloadingText: string;
}) => (
  <div
    style={{
      color: isLightTheme ? '#6b7280' : '#d1d5db',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <div style={{ ...classes.spinner, marginRight: '8px' }}></div>
    <div>
      {downloadingText} {progress}%
    </div>
  </div>
);

export default DownloadProgress;
