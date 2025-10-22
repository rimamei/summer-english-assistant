import type { CSSProperties } from 'react';
import { Languages } from 'lucide-react';

interface TranslationIconProps {
  position: { x: number; y: number };
  onClick: () => void;
  isVisible: boolean;
}

export function TranslationIcon({ position, onClick, isVisible }: TranslationIconProps) {
  if (!isVisible) return null;

  const iconStyle: CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: '32px',
    height: '32px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2147483647,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '2px solid white',
    transition: 'all 0.2s ease',
    animation: 'summer-translation-appear 0.2s ease-out',
    color: 'white',
    // Prevent text selection on the icon
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

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
        style={iconStyle}
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