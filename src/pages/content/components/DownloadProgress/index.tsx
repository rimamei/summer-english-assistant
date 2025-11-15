const DownloadProgress = ({
  progress,
  isLightTheme,
  downloadingText,
}: {
  progress: number;
  isLightTheme: boolean;
  downloadingText: string;
}) => (
  <div style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>
    <div style={{ marginBottom: '8px' }}>
      {downloadingText} {progress}%
    </div>
    <div
      style={{
        width: '100%',
        height: '4px',
        backgroundColor: isLightTheme ? '#e5e7eb' : '#4b5563',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#3b82f6',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  </div>
);

export default DownloadProgress;
