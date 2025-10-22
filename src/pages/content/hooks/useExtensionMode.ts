import { useCallback } from 'react';
import { useExtension } from './useExtension';
import { useNotifications } from './useNotifications';

interface useExtensionModeProps {
  mode: 'highlight' | 'screenshot';
  isHighlightMode: boolean;
  isScreenshotMode: boolean;
  enableHighlightMode: () => void;
  enableScreenshotMode: () => void;
  closeModeModal: () => void;
}

export function useExtensionMode(): useExtensionModeProps {
  const { state, setState } = useExtension();
  const { showNotification } = useNotifications();

  const enableHighlightMode = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      mode: 'highlight',
    }));
    
    // Show notification
    showNotification('Highlight mode enabled! Select text to translate.', '#10b981');
  }, [setState, showNotification]);

  const enableScreenshotMode = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      mode: 'screenshot',
    }));
    
    // Show notification
    showNotification('Screenshot mode enabled! Click to capture area.', '#f59e0b');
  }, [setState, showNotification]);

  const closeModeModal = useCallback(() => {
    setState(prev => ({ ...prev, showModeModal: false }));
  }, [setState]);

  return {
    mode: state.mode,
    isHighlightMode: state.mode === 'highlight',
    isScreenshotMode: state.mode === 'screenshot',
    closeModeModal,
    enableHighlightMode,
    enableScreenshotMode
  };
}