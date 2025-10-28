import { useState, type CSSProperties, type JSX } from 'react';
import { classes } from './style';
import { useStorage } from '../../hooks/useStorage';

interface TooltipProps {
  text: string;
  customStyles?: CSSProperties;
  children: React.ReactNode | JSX.Element;
}

export function Tooltip({ text, customStyles, children }: TooltipProps) {
  const { isLightTheme } = useStorage();
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={customStyles}
      >
        {children}
      </div>

      {/* Render tooltip only when visible */}
      {isVisible && (
        <div 
          style={{
            ...classes.tooltipContainer,
            backgroundColor: isLightTheme ? '#1f2937' : '#f9fafb',
            color: isLightTheme ? '#ffffff' : '#1f2937',
            border: isLightTheme ? 'none' : '1px solid #e5e7eb',
          }}
        >
          {text}
        </div>
      )}
    </>
  );
}
