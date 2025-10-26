import { XIcon } from 'lucide-react';
import { classes } from './style';
import { useDraggable } from '../../hooks/useDraggable';
import { modeOptions } from '@/pages/popup/constants';
import FullTranslation from './FullTranslation';
import { useStorage } from '../../hooks/useStorage';
import GrammarAnalyzer from './GrammarAnalyzer';
import Summarization from './Summarization';

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
  const { mode } = useStorage();

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
  };

  return (
    <div
      style={{
        ...classes.modalStyle,
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
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <span style={classes.modalHeadTitle}>
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
              color: '#6b7280',
            }}
            size={16}
          />
        </button>
      </div>
      {modeView[mode as keyof typeof modeView]}
    </div>
  );
}
