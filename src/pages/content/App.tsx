import { useEffect } from 'react';
import { useTextSelection } from './hooks/useTextSelection';
import { useTranslationModal } from './hooks/useTranslationModal';
import { injectStyles } from './styles';
import { useStorage } from '@/hooks/useStorage';
import { useExtensionMode } from './hooks/useExtensionMode';
import ScreenshotOverlay from './components/ScreenshotOverlay';
import ScreenshotSelector from './components/ScreenshotSelector';
import { FloatingIcon, ModeModal, ResultModal } from './features';

interface MainProps {
  shadowRoot: ShadowRoot | null;
}

const App = ({ shadowRoot }: MainProps) => {
  const { enableExtension } = useStorage();
  const { selection, clearSelection } = useTextSelection();
  const { isScreenshotMode } = useExtensionMode();

  const { showTranslationModal, translationPosition, openTranslationModal, closeTranslationModal } =
    useTranslationModal();

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

  const handleScreenshotCapture = (
    dataUrl: string,
    position: { x: number; y: number },
    area: { x: number; y: number; width: number; height: number }
  ) => {
    // Open the result modal with screenshot data first
    openTranslationModal(dataUrl, position, area);
  };

  const handleScreenshotCancel = () => {
    closeTranslationModal();
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

          {/* Screenshot Overlay - appears when screenshot mode is active */}
          {isScreenshotMode && (
            <ScreenshotOverlay
              onScreenshotCapture={handleScreenshotCapture}
              onCancel={handleScreenshotCancel}
            />
          )}

          {/* Screenshot Selector - shows the selected area while modal is open */}
          <ScreenshotSelector />

          {/* Translation Icon - appears when text is selected */}
          {selection && !isScreenshotMode && (
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
