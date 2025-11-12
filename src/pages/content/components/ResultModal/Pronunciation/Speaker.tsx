import { Volume2 } from "lucide-react";
import { useState } from "react";

interface SpeakerButtonProps {
  onClick: () => void;
  isLightTheme: boolean;
}

const SpeakerButton = ({ onClick, isLightTheme }: SpeakerButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        backgroundColor: isHovered
          ? isLightTheme
            ? '#f3f4f6'
            : '#374151'
          : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      title="Listen to pronunciation"
    >
      <Volume2
        size={16}
        style={{ color: isLightTheme ? '#6b7280' : '#9ca3af' }}
      />
    </button>
  );
};

export default SpeakerButton;