import { Languages } from 'lucide-react';
import { classes } from './style';

interface FloatingIconProps {
  position: { x: number; y: number };
  onClick: () => void;
  isVisible: boolean;
}

export function FloatingIcon({
  position,
  onClick,
  isVisible,
}: FloatingIconProps) {
  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'scale(1.1)';
    target.style.backgroundColor = '#2563eb';
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'scale(1)';
    target.style.backgroundColor = '#3b82f6';
  };

  return (
    <>
      <div
        data-summer-extension="translation-icon"
        style={{
          ...classes.iconStyle,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Translate selected text"
      >
        <Languages size={16} />
      </div>
    </>
  );
}
