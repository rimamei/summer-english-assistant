import { useEffect } from 'react';
import ModeModal from './components/ModeModal';
import { TranslationIcon } from './components/TranslationIcon';
import { TranslationModal } from './components/TranslationModal';
import { useTextSelection } from './hooks/useTextSelection';
import { useTranslationModal } from './hooks/useTranslationModal';
import { injectStyles } from './styles';

interface MainProps {
  shadowRoot: ShadowRoot | null;
}

const App = ({ shadowRoot }: MainProps) => {
  const { selection, clearSelection } = useTextSelection();
  const {
    showTranslationModal,
    translationText,
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
        <TranslationIcon
          position={selection?.position || { x: 0, y: 0 }}
          onClick={handleTranslationClick}
          isVisible={!!selection && !showTranslationModal}
        />

        {/* Translation Modal */}
        <TranslationModal
          isVisible={showTranslationModal}
          originalText={translationText}
          onClose={handleCloseTranslationModal}
          position={translationPosition}
        />
      </div>
    </div>
  );
};

export default App;
