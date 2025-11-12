import { useCallback, useEffect } from 'react';
import { useExtension } from './useContext';
import { useNotifications } from './useNotifications';
import { useStorage } from '@/hooks/useStorage';

interface useExtensionModeProps {
  mode: 'highlight' | 'screenshot' | 'disabled';
  isHighlightMode: boolean;
  isScreenshotMode: boolean;
  showModeModal: boolean;
  enableHighlightMode: () => void;
  enableScreenshotMode: () => void;
  closeModeModal: () => void;
  disableModes: () => void;
}

export function useExtensionMode(): useExtensionModeProps {
  const { preferences } = useStorage();

  const { state, setState } = useExtension();
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (preferences?.agent === 'chrome' && state.mode === 'screenshot') {
      setState(prev => ({ ...prev, mode: 'highlight' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences])


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

  const closeModeModal = useCallback(async () => {
    await chrome.storage.local.set({ ext_status: false });
    setState(prev => ({ ...prev, showModeModal: false, mode: 'disabled' }));
  }, [setState]);

  const disableModes = useCallback(async () => {
    setState(prev => ({ ...prev, mode: 'disabled' }));
  }, [setState]);

  return {
    mode: state.mode,
    showModeModal: state.showModeModal,
    isHighlightMode: state.mode === 'highlight',
    isScreenshotMode: state.mode === 'screenshot',
    closeModeModal,
    enableHighlightMode,
    enableScreenshotMode,
    disableModes,
  };
}