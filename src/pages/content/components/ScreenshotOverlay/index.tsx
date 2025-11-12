import { useEffect, useRef } from 'react';
import { useScreenshot } from '../../hooks/useScreenshot';

interface ScreenshotOverlayProps {
  onScreenshotCapture: (dataUrl: string, position: { x: number; y: number }, area: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

const ScreenshotOverlay = ({ onScreenshotCapture, onCancel }: ScreenshotOverlayProps) => {
  const {
    isSelecting,
    screenshotArea,
    startSelection,
    updateSelection,
    finishSelection,
    cancelSelection,
  } = useScreenshot();

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelSelection();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cancelSelection, onCancel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startSelection(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      updateSelection(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = async () => {
    if (!isSelecting || !screenshotArea) return;

    const dataUrl = await finishSelection();
    if (dataUrl) {
      // Calculate viewport position for the result modal
      const viewportX = Math.min(screenshotArea.startX, screenshotArea.endX);
      const viewportY = Math.min(screenshotArea.startY, screenshotArea.endY);
      const width = Math.abs(screenshotArea.endX - screenshotArea.startX);
      const height = Math.abs(screenshotArea.endY - screenshotArea.startY);

      // Calculate document (absolute) position by adding scroll offset
      const documentX = viewportX + window.scrollX;
      const documentY = viewportY + window.scrollY;

      onScreenshotCapture(dataUrl, { x: viewportX, y: viewportY }, { x: documentX, y: documentY, width, height });
    } else {
      onCancel();
    }
  };

  // Calculate selection rectangle
  const getSelectionStyle = () => {
    if (!screenshotArea) return {};

    const x = Math.min(screenshotArea.startX, screenshotArea.endX);
    const y = Math.min(screenshotArea.startY, screenshotArea.endY);
    const width = Math.abs(screenshotArea.endX - screenshotArea.startX);
    const height = Math.abs(screenshotArea.endY - screenshotArea.startY);

    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent',
        cursor: 'crosshair',
        zIndex: 2147483646,
        pointerEvents: 'auto',
      }}
    >
      {/* Selection rectangle */}
      {screenshotArea && (
        <div
          style={{
            position: 'absolute',
            border: '2px solid oklch(0.7378 0.1773 50.74)',
            backgroundColor: 'oklch(0.7378 0.1773 50.74 / 0.1)',
            pointerEvents: 'none',
            zIndex: 2147483647,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
            ...getSelectionStyle(),
          }}
        >
          {/* Corner indicators */}
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              left: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: 'oklch(0.7378 0.1773 50.74)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px oklch(0.7378 0.1773 50.74 / 0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: 'oklch(0.7378 0.1773 50.74)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px oklch(0.7378 0.1773 50.74 / 0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: 'oklch(0.7378 0.1773 50.74)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px oklch(0.7378 0.1773 50.74 / 0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: 'oklch(0.7378 0.1773 50.74)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px oklch(0.7378 0.1773 50.74 / 0.5)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ScreenshotOverlay;
