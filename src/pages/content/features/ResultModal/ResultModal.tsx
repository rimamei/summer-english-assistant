import { XIcon } from 'lucide-react';
import { classes } from './style';
import { useDraggable } from '../../hooks/useDraggable';
import FullTranslation from './FullTranslation';
import { useStorage } from '@/hooks/useStorage';
import GrammarAnalyzer from './GrammarAnalyzer';
import Summarization from './Summarization';
import Pronunciation from './Pronunciation';
import { useCallback, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { modeOptions } from '@/pages/popup/constants';
import { useExtension } from '../../hooks/useContext';

interface ResultModalProps {
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

const ResultModal = ({ isVisible, onClose, position = { x: 0, y: 0 } }: ResultModalProps) => {
  const { mode, isLightTheme } = useStorage();
  const { state } = useExtension();

  const modalRef = useRef<HTMLDivElement>(null!);
  const handleClickOutside = useCallback(() => {
    if (isVisible) onClose();
  }, [isVisible, onClose]);

  useClickOutside(modalRef, handleClickOutside);

  // Calculate position based on screenshot area if available
  const calculatedPosition = state.screenshotArea
    ? {
        // Convert document coordinates to viewport coordinates and center horizontally
        x: state.screenshotArea.x - window.scrollX + state.screenshotArea.width / 2 - 200, // 200 is half of modal width (400px)
        // Position below the screenshot area with some padding
        y: state.screenshotArea.y - window.scrollY + state.screenshotArea.height + 20,
      }
    : position;

  const {
    position: draggablePosition,
    isDragging,
    handleMouseDown,
  } = useDraggable({
    initialPosition: calculatedPosition,
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
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      style={{
        ...classes.modalStyle,
        backgroundColor: isLightTheme ? '#ffffff' : '#1c1c1c',
        border: isLightTheme ? '1px solid #e5e7eb' : '2px solid #1c1c1c',
        left: `${Math.min(draggablePosition.x || position.x, window.innerWidth - 400)}px`,
        top: `${Math.max(draggablePosition.y || position.y + 40, 20)}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        boxShadow: isLightTheme ? '0 1px 2px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          ...classes.modalHead,
          borderBottom: isLightTheme ? '1px solid #e5e7eb' : '1px solid #374151',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <span
          style={{
            ...classes.modalHeadTitle,
            color: isLightTheme ? '#111827' : '#f9fafb',
          }}
        >
          {modeOptions.find(opt => opt.value === mode)?.label}
        </span>
        <button
          onClick={e => {
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
      <div
        style={{
          backgroundColor: isLightTheme ? '#f8f1e7' : '#2d2d2d',
          marginTop: '4px',
          borderRadius: '12px',
          minHeight: '50px',
          padding: '8px',
        }}
      >
        {modeView[mode as keyof typeof modeView]}
      </div>
    </div>
  );
};

export default ResultModal;
