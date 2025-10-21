import { useState } from 'react';
import { classes } from './style';
import { Camera, GripVertical, Highlighter, Power } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { useDraggable } from '../../hooks/useDraggable';

export function ContentModal() {
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null
  );

  const { position, isDragging, handleMouseDown } = useDraggable();
  
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Function to get button style with simple grey hover effect
  const getButtonStyle = (index: number) => {
    const isHovered = hoveredButtonIndex === index;

    return {
      ...classes.plainButton,
      ...(isHovered
        ? {
            backgroundColor: '#f3f4f6',
            padding: '8px',
            borderRadius: '8px',
          }
        : {
            backgroundColor: 'transparent',
            padding: '8px',
            borderRadius: '8px',
          }),
    };
  };

  const options = [
    {
      icon: <Highlighter size={18} />,
      action: () => {
        console.log('Highlight action');
      },
      title: 'Highlight Text',
    },
    {
      icon: <Camera size={18} />,
      action: () => {
        console.log('Capture action');
      },
      title: 'Capture Screenshot',
    },
    {
      icon: <Power size={18} />,
      action: () => {
        handleClose();
      },
      title: 'Close Extension',
    },
  ];

  return (
    <div style={{
      ...classes.summerContainer,
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: isDragging ? 'grabbing' : 'default',
    }}>
      <div
        style={{
          color: '#9ca3af',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
        }}
        onMouseDown={handleMouseDown}
      >
        <GripVertical size={16} />
      </div>

      <div style={classes.optionsContainer}>
        {options.map((option, index) => (
          <button
            key={index}
            style={{ ...getButtonStyle(index), position: 'relative' }}
            onClick={option.action}
            onMouseEnter={() => {
              setHoveredButtonIndex(index);
            }}
            onMouseLeave={() => {
              setHoveredButtonIndex(null);
            }}
          >
            <Tooltip text={option.title}>{option.icon}</Tooltip>
          </button>
        ))}
      </div>
    </div>
  );
}
