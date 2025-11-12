import { classes } from "../style";

interface InfoSectionProps {
  label: string;
  value: string;
  isLightTheme: boolean;
}

const InfoSection = ({ label, value, isLightTheme }: InfoSectionProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
    <span
      style={{
        ...classes.contentText,
        fontWeight: 'normal',
        color: isLightTheme ? '#6b7280' : '#d1d5db',
      }}
    >
      <b>{label}</b>
    </span>
    <span
      style={{
        ...classes.contentText,
        fontWeight: 'normal',
        color: isLightTheme ? '#6b7280' : '#d1d5db',
      }}
    >
      {value}
    </span>
  </div>
);

export default InfoSection;