import { useEffect } from 'react';
import ModeModal from './components/ModeModal';
import { FloatingIcon } from './components/FloatingIcon';
import { ResultModal } from './components/ResultModal';
import { useTextSelection } from './hooks/useTextSelection';
import { useTranslationModal } from './hooks/useTranslationModal';
import { injectStyles } from './styles';
import { useStorage } from '@/hooks/useStorage';

interface MainProps {
  shadowRoot: ShadowRoot | null;
}

const App = ({ shadowRoot }: MainProps) => {
  const { enableExtension } = useStorage();
  const { selection, clearSelection } = useTextSelection();

  const {
    showTranslationModal,
    translationPosition,
    openTranslationModal,
    closeTranslationModal,
  } = useTranslationModal();

  // Inject styles (keyframe) when component mounts
  useEffect(() => {
    injectStyles(shadowRoot);
  }, [shadowRoot]);

  const handleTranslationClick = () => {
    if (selection) {
      openTranslationModal(selection.text, selection.position);
    }
  };

  const handleCloseTranslationModal = () => {
    closeTranslationModal();
    clearSelection();
  };

  if (enableExtension) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <ModeModal />

          {/* Translation Icon - appears when text is selected */}
          {selection && (
            <FloatingIcon
              position={selection.position}
              onClick={handleTranslationClick}
              isVisible={!showTranslationModal}
            />
          )}

          {/* Result Modal */}
          <ResultModal
            isVisible={showTranslationModal}
            onClose={handleCloseTranslationModal}
            position={translationPosition}
          />
        </div>
      </div>
    );
  }

  return <></>;
};

export default App;
