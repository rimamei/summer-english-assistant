import { useState } from 'react';
import { classes } from './style';
import {
  Camera,
  // Camera,
  GripVertical,
  Highlighter,
  Power,
} from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { useDraggable } from '../../hooks/useDraggable';
import { useExtensionMode } from '../../hooks/useExtensionMode';
import { useStorage } from '@/hooks/useStorage';
import { useI18n } from '@/hooks/useI18n';

const ModeModal = () => {
  const { t } = useI18n();
  const { isLightTheme, preferences } = useStorage();

  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(null);

  const { position, isDragging, handleMouseDown } = useDraggable({});
  const { enableHighlightMode, enableScreenshotMode, mode, closeModeModal } = useExtensionMode();

  // Function to get button style with theme-aware hover effect
  const getButtonStyle = (index: number) => {
    const isHovered = hoveredButtonIndex === index;

    return {
      ...classes.plainButton,
      color: isLightTheme ? '#6b7280' : '#9ca3af',
      ...(isHovered
        ? {
            backgroundColor: isLightTheme ? '#f3f4f6' : '#4c4c4c',
            padding: '8px',
            borderRadius: '8px',
          }
        : {}),
    };
  };

  const allOptions = [
    {
      icon: <Highlighter size={18} />,
      action: () => {
        enableHighlightMode();
      },
      title: t('enable_text_translation'),
      key: 'highlight',
    },
    {
      icon: <Camera size={18} />,
      action: () => {
        enableScreenshotMode();
      },
      title: t('capture_screenshot'),
      key: 'screenshot',
    },
    {
      icon: <Power size={18} />,
      action: () => {
        closeModeModal();
      },
      title: t('extension_off'),
      key: 'close',
    },
  ];

  // Filter out screenshot option for Chrome agent
  const options = allOptions.filter(option => {
    if (option.key === 'screenshot' && preferences?.agent === 'chrome') {
      return false;
    }
    return true;
  });

  return (
    <div
      style={{
        ...classes.modalContainer,
        backgroundColor: isLightTheme ? '#ffffff' : '#1c1c1c',
        border: isLightTheme ? '1px solid #e5e7eb' : '2px solid #4c4c4c',
        color: isLightTheme ? '#1f2937' : '#f9fafb',
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <div
        style={{
          color: isLightTheme ? '#9ca3af' : '#6b7280',
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
                backgroundColor: isLightTheme ? '#f3f4f6' : '#4c4c4c',
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
