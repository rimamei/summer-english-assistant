import { useEffect, useCallback, useRef } from 'react';
import { useExtension } from './useContext';
import type { ISelectionInfo } from '@/type/textSelection';
import { translation } from '@/service/translator';
import { useSettings } from './useSettings';

interface UseTextSelectionReturn {
  selection: ISelectionInfo | null;
  clearSelection: () => void;
}

const DEBOUNCE_DELAY = 50;
const TOOLTIP_OFFSET = { x: 10, y: -5 };

export function useTextSelection(): UseTextSelectionReturn {
  const { state, setState } = useExtension();
  const { sourceLanguage, targetLanguage } = useSettings();

  const timeoutRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // Helper functions
  const clearState = useCallback((includeTranslation = false) => {
    setState(prev => ({
      ...prev,
      selectionInfo: null,
      ...(includeTranslation && { translationText: '' })
    }));
  }, [setState]);

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const getSelectionData = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const text = selection.toString().trim();
    if (!text) return null;

    const range = selection.getRangeAt(0);
    
    // Check if selection is within extension elements (modal, tooltips, etc.)
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement 
      : container as Element;
      
    if (element && element.closest('[data-summer-extension]')) {
      return null; // Don't process selections within extension elements
    }

    const rect = range.getBoundingClientRect();

    return {
      text,
      position: {
        x: rect.right + TOOLTIP_OFFSET.x,
        y: rect.top + TOOLTIP_OFFSET.y,
      },
      range: range.cloneRange(),
    };
  }, []);

  const handleTranslationResult = useCallback((result: string | null, originalText: string) => {
    if (!result) {
      setState(prev => ({
        ...prev,
        translationText: 'Translation failed - no result returned',
      }));
      return;
    }

    if (result === originalText) {
      setState(prev => ({
        ...prev,
        translationText: 'Translation returned same text - check language settings',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      translationText: result,
    }));
  }, [setState]);

  const performTranslation = useCallback(async (text: string) => {
    console.log('Translation settings:', { sourceLanguage, targetLanguage });

    // Check if languages are configured
    if (!sourceLanguage || !targetLanguage) {
      setState(prev => ({
        ...prev,
        translationText: 'Please configure source and target languages in settings',
      }));
      return;
    }

    // Check if languages are different
    if (sourceLanguage === targetLanguage) {
      setState(prev => ({
        ...prev,
        translationText: `Same language (${sourceLanguage}) - no translation needed`,
      }));
      return;
    }

    try {
      console.log('Starting translation...');
      const result = await translation(sourceLanguage, targetLanguage, text);
      console.log('Translation result:', result);
      
      handleTranslationResult(result, text);
    } catch (error) {
      console.error('Translation failed:', error);
      setState(prev => ({
        ...prev,
        translationText: `Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    }
  }, [sourceLanguage, targetLanguage, setState, handleTranslationResult]);

  const processSelection = useCallback(async () => {
    // Prevent concurrent executions
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const selectionData = getSelectionData();
      
      if (!selectionData) {
        clearState();
        return;
      }

      console.log('Selected text:', selectionData.text);

      // Update selection info
      setState(prev => ({
        ...prev,
        selectionInfo: selectionData,
      }));

      // Handle translation
      await performTranslation(selectionData.text);

    } catch (error) {
      console.error('Selection processing failed:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [getSelectionData, clearState, setState, performTranslation]);

  const handleSelectionChange = useCallback(() => {
    clearTimeout();
    timeoutRef.current = window.setTimeout(processSelection, DEBOUNCE_DELAY);
  }, [clearTimeout, processSelection]);

  const clearSelection = useCallback(() => {
    clearTimeout();
    clearState(true);
    
    // Clear browser selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, [clearTimeout, clearState]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    
    // Don't clear if clicking on extension elements
    if (target.closest('[data-summer-extension]')) {
      return;
    }

    // Don't clear if there's currently a text selection anywhere on the page
    // This prevents clearing when user is actively selecting text
    const currentSelection = window.getSelection();
    if (currentSelection && currentSelection.toString().trim().length > 0) {
      return;
    }

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || !selection.toString().trim()) {
        clearState(true);
      }
    });
  }, [clearState]);

  // Event listeners
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      clearTimeout();
    };
  }, [handleSelectionChange, clearTimeout]);

  useEffect(() => {
    // Only add the click outside handler if there's no active selection/modal
    // This prevents interference with modal text selection
    if (!state.selectionInfo) {
      document.addEventListener('click', handleClickOutside, { passive: true });
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside, state.selectionInfo]);

  return {
    selection: state.selectionInfo,
    clearSelection,
  };
}