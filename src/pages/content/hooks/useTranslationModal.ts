import { useCallback } from 'react';
import { useExtension } from './useContext';
interface UseTranslationModalReturn {
  showTranslationModal: boolean;
  translationPosition: { x: number; y: number };
  openTranslationModal: (position: { x: number; y: number }) => void;
  closeTranslationModal: () => void;
  resetTranslation: () => void;
}

export function useTranslationModal(): UseTranslationModalReturn {
  const { state, setState } = useExtension();

  const openTranslationModal = useCallback(async (position: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      showTranslationModal: true,
      translationPosition: position,
      isHighlightMode: false,
    }));
  }, []);

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