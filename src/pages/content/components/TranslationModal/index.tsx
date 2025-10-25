import { XIcon } from 'lucide-react';
import { classes } from './style';
import { useSettings } from '../../hooks/useSettings';
import { useDraggable } from '../../hooks/useDraggable';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTranslationModal } from '../../hooks/useTranslationModal';
import { useExtension } from '../../hooks/useContext';
import { modeOptions } from '@/pages/popup/constants';

interface TranslationModalProps {
  isVisible: boolean;
  originalText: string;
  onClose: () => void;
  position?: { x: number; y: number };
}

function LoadingDots() {
  return (
    <span className="loading-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );
}

export function TranslationModal({
  isVisible,
  onClose,
  position = { x: 0, y: 0 },
}: TranslationModalProps) {
  const { mode } = useSettings();
  const { state } = useExtension();
  const { translationText } = useTranslationModal();
  
  const selectedText = state.selectionInfo?.text || '';
  const isLoading = selectedText && (!translationText || translationText.includes('Loading') || translationText.includes('error'));

  const {
    position: draggablePosition,
    isDragging,
    handleMouseDown,
  } = useDraggable({
    initialPosition: position,
  });
  const modalRef = useClickOutside({
    isOpen: isVisible,
    onClose,
    isDragging,
  });

  if (!isVisible) return null;

  console.log('TranslationModal', translationText);
  console.log('TranslationModal state', translationText);

  return (
    <div
      ref={modalRef}
      data-summer-extension="translation-modal"
      onClick={(e) => e.stopPropagation()}
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
          borderBottom: '1px solid #e5e7eb',
          padding: '4px 6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontWeight: '600',
            fontSize: '12px',
            color: '#111827',
            marginRight: '42px',
          }}
        >
          {modeOptions.find((opt) => opt.value === mode)?.label}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <XIcon
            style={{
              color: '#6b7280',
            }}
            size={16}
          />
        </button>
      </div>
      <div
        style={{
          padding: '8px',
        }}
      >
        <div
          style={{
            marginBottom: '12px',
          }}
        >
          <p style={classes.smallText}>
            {mode === 'pronunciation' ? 'How to pronounce' : 'Translation for'} <b>{selectedText}</b>?
          </p>
          <p style={{
            ...classes.contentText,
            userSelect: 'text',
            cursor: 'text',
          }}>
            {isLoading ? (
              <span style={{ color: '#6b7280' }}>
                Loading<LoadingDots />
              </span>
            ) : (
              translationText || 'No translation available'
            )}
          </p>
        </div>
        {mode === 'pronunciation' && (
          <div>
            <p style={classes.smallText}>Definition</p>
            <p style={{
              ...classes.contentText,
              userSelect: 'text',
              cursor: 'text',
            }}>
              {isLoading ? (
                <span style={{ color: '#6b7280' }}>
                  Loading<LoadingDots />
                </span>
              ) : (
                '/lɜrn/ - UK: /lɜːn/ - US: Verb'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
