const NoContentMessage = ({
  message,
  isLightTheme,
}: {
  message: string;
  isLightTheme: boolean;
}) => <span style={{ color: isLightTheme ? '#6b7280' : '#d1d5db' }}>{message}</span>;

export default NoContentMessage;
