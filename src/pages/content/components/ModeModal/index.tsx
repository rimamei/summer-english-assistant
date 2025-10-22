import { useState } from 'react';
import { classes } from './style';
import { Camera, GripVertical, Highlighter, Power } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { useDraggable } from '../../hooks/useDraggable';
import { useExtensionMode } from '../../hooks/useExtensionMode';

const ModeModal = () => {
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null
  );

  const { position, isDragging, handleMouseDown } = useDraggable();
  const { enableHighlightMode, enableScreenshotMode, mode, closeModeModal } =
    useExtensionMode();

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
        : {}),
    };
  };

  const options = [
    {
      icon: <Highlighter size={18} />,
      action: () => {
        enableHighlightMode();
      },
      title: 'Enable Text Translation',
      key: 'highlight',
    },
    {
      icon: <Camera size={18} />,
      action: () => {
        enableScreenshotMode();
      },
      title: 'Capture Screenshot',
      key: 'screenshot',
    },
    {
      icon: <Power size={18} />,
      action: () => {
        closeModeModal();
      },
      title: 'Hide Mode Selector',
      key: 'close',
    },
  ];

  return (
    <div
      style={{
        ...classes.modalContainer,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
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
            style={{
              position: 'relative',
              ...getButtonStyle(index),
              ...(option.key === mode && {
                backgroundColor: '#f3f4f6',
              }),
            }}
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
};

export default ModeModal;
