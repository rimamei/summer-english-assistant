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
      gap: '8px',
    }}
  >
    <div style={classes.spinner}></div>
    <div>
      {downloadingText} {progress}%
    </div>
  </div>
);

export default DownloadProgress;
