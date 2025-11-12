import { classes } from "../style";

interface SoundBySoundListProps {
  sounds: Array<{ symbol: string; exampleWord: string }>;
  label: string;
  asInLabel: string;
  isLightTheme: boolean;
}

const SoundBySoundList = ({
  sounds,
  label,
  asInLabel,
  isLightTheme,
}: SoundBySoundListProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      marginTop: '8px',
    }}
  >
    <span
      style={{
        ...classes.smallText,
        fontWeight: 'normal',
        color: isLightTheme ? '#6b7280' : '#d1d5db',
      }}
    >
      <b>{label}</b>
    </span>
    <ul
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        listStylePosition: 'inside',
        padding: 0,
        margin: 0,
      }}
    >
      {sounds.map((item, index) => (
        <li key={index}>
          <span
            style={{
              ...classes.smallText,
              fontWeight: 'normal',
              color: isLightTheme ? '#6b7280' : '#d1d5db',
            }}
          >
            <b>{item?.symbol}</b> {asInLabel} <b>{item?.exampleWord}</b>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default SoundBySoundList;
