import { useState, type CSSProperties, type JSX } from 'react';
import { classes } from './style';

interface TooltipProps {
  text: string;
  customStyles?: CSSProperties;
  children: React.ReactNode | JSX.Element;
}

export function Tooltip({ text, customStyles, children }: TooltipProps) {
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
      {isVisible && <div style={classes.tooltipContainer}>{text}</div>}
    </>
  );
}
