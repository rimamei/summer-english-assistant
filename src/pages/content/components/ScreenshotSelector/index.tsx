import { useExtension } from '../../hooks/useContext';

const ScreenshotSelector = () => {
  const { state } = useExtension();

  if (!state.screenshotArea || !state.showTranslationModal) return null;

  const { x, y, width, height } = state.screenshotArea;

  // Convert document coordinates back to viewport coordinates
  const viewportX = x - window.scrollX;
  const viewportY = y - window.scrollY;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${viewportX}px`,
        top: `${viewportY}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '3px solid oklch(0.7378 0.1773 50.74)',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 2147483645,
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'pulse-border 2s ease-in-out infinite',
      }}
    >
      {/* Corner markers */}
      <div
        style={{
          position: 'absolute',
          top: '-6px',
          left: '-6px',
          width: '12px',
          height: '12px',
          backgroundColor: 'oklch(0.7378 0.1773 50.74)',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '12px',
          height: '12px',
          backgroundColor: 'oklch(0.7378 0.1773 50.74)',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '-6px',
          width: '12px',
          height: '12px',
          backgroundColor: 'oklch(0.7378 0.1773 50.74)',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          right: '-6px',
          width: '12px',
          height: '12px',
          backgroundColor: 'oklch(0.7378 0.1773 50.74)',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
        }}
      />
    </div>
  );
};

export default ScreenshotSelector;
