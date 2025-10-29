import { XIcon } from 'lucide-react';
import { classes } from './style';
import { useDraggable } from '../../hooks/useDraggable';
import FullTranslation from './FullTranslation';
import { useStorage } from '@/hooks/useStorage';
import GrammarAnalyzer from './GrammarAnalyzer';
import Summarization from './Summarization';
import Pronunciation from './Pronunciation';
import { useTranslatedOptions } from '@/hooks/useTranslatedOptions';
import { useCallback, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface TranslationModalProps {
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function TranslationModal({
  isVisible,
  onClose,
  position = { x: 0, y: 0 },
}: TranslationModalProps) {
  const { mode, isLightTheme } = useStorage();
  const { modeOptions } = useTranslatedOptions();

  const modalRef = useRef<HTMLDivElement>(null!);
  const handleClickOutside = useCallback(() => {
    if (isVisible) onClose();
  }, [isVisible, onClose]);

  useClickOutside(modalRef, handleClickOutside);

  const {
    position: draggablePosition,
    isDragging,
    handleMouseDown,
  } = useDraggable({
    initialPosition: position,
  });

  if (!isVisible) return null;

  const modeView = {
    translation: <FullTranslation />,
    grammar: <GrammarAnalyzer />,
    summarizer: <Summarization />,
    pronunciation: <Pronunciation />,
  };

  return (
    <div
      ref={modalRef}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      style={{
        ...classes.modalStyle,
        backgroundColor: isLightTheme ? '#ffffff' : '#1f2937',
        borderColor: isLightTheme ? '#e5e7eb' : '#374151',
        left: `${Math.min(
          draggablePosition.x || position.x,
          window.innerWidth - 400
        )}px`,
        top: `${Math.max(draggablePosition.y || position.y + 40, 20)}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          ...classes.modalHead,
          borderBottomColor: isLightTheme ? '#e5e7eb' : '#374151',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <span
          style={{
            ...classes.modalHeadTitle,
            color: isLightTheme ? '#111827' : '#f9fafb',
          }}
        >
          {modeOptions.find((opt) => opt.value === mode)?.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={classes.closeButton}
        >
          <XIcon
            style={{
              color: isLightTheme ? '#6b7280' : '#9ca3af',
            }}
            size={16}
          />
        </button>
      </div>

      {modeView[mode as keyof typeof modeView]}
    </div>
  );
}
