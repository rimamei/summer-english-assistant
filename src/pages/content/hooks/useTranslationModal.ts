import { useCallback } from 'react';
import { useExtension } from './useContext';
interface UseTranslationModalReturn {
  showTranslationModal: boolean;
  translationPosition: { x: number; y: number };
  openTranslationModal: (
    selectedText: string,
    position: { x: number; y: number },
    area?: { x: number; y: number; width: number; height: number }
  ) => void;
  closeTranslationModal: () => void;
  resetTranslation: () => void;
}

export function useTranslationModal(): UseTranslationModalReturn {
  const { state, setState } = useExtension();

  const openTranslationModal = useCallback(
    async (
      selectedTextOrScreenshot: string,
      position: { x: number; y: number },
      area?: { x: number; y: number; width: number; height: number }
    ) => {
      // Check if it's a screenshot data URL
      const isScreenshot = selectedTextOrScreenshot.startsWith('data:image');

      setState(prev => ({
        ...prev,
        selectedText: isScreenshot ? '' : selectedTextOrScreenshot,
        screenshotData: isScreenshot ? selectedTextOrScreenshot : null,
        screenshotArea: area || null,
        showTranslationModal: true,
        translationPosition: position,
        mode: prev.mode === 'screenshot' ? prev.mode : 'highlight',
      }));
    },
    [setState]
  );

  const closeTranslationModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTranslationModal: false,
      screenshotData: null,
      screenshotArea: null,
    }));
  }, [setState]);

  const resetTranslation = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTranslationModal: false,
      translationText: '',
      translationPosition: { x: 0, y: 0 },
      screenshotData: null,
      screenshotArea: null,
    }));
  }, [setState]);

  return {
    showTranslationModal: state.showTranslationModal,
    translationPosition: state.translationPosition,
    openTranslationModal,
    closeTranslationModal,
    resetTranslation,
  };
}
