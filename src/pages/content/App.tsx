import { useEffect } from 'react';
import ModeModal from './components/ModeModal';
import { TranslationIcon } from './components/TranslationIcon';
import { TranslationModal } from './components/TranslationModal';
import { useTextSelection } from './hooks/useTextSelection';
import { useTranslationModal } from './hooks/useTranslationModal';
import { injectStyles } from './styles';
import { useStorage } from './hooks/useStorage';

interface MainProps {
  shadowRoot: ShadowRoot | null;
}

const App = ({ shadowRoot }: MainProps) => {
  const { settingsData } = useStorage();
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

  if (settingsData.enabled_extension) {
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
          {selection?.position && (
            <TranslationIcon
              position={selection?.position || { x: 0, y: 0 }}
              onClick={handleTranslationClick}
              isVisible={!!selection && !showTranslationModal}
            />
          )}

          {/* Translation Modal */}
          <TranslationModal
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
