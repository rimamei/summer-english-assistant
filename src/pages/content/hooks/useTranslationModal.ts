import { useCallback } from 'react';
import { useExtension } from './useContext';
interface UseTranslationModalReturn {
  showTranslationModal: boolean;
  translationPosition: { x: number; y: number };
  openTranslationModal: (selectedText: string, position: { x: number; y: number }) => void;
  closeTranslationModal: () => void;
  resetTranslation: () => void;
}

export function useTranslationModal(): UseTranslationModalReturn {
  const { state, setState } = useExtension();

  const openTranslationModal = useCallback(async (selectedText: string, position: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      selectedText,
      showTranslationModal: true,
      translationPosition: position,
      isHighlightMode: false,
    }));
  }, [setState]);

  const closeTranslationModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTranslationModal: false,
    }));
  }, [setState]);

  const resetTranslation = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTranslationModal: false,
      translationText: '',
      translationPosition: { x: 0, y: 0 },
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