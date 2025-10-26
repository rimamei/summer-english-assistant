import { useEffect, useCallback, useRef } from 'react';
import { useExtension } from './useContext';
import type { ISelectionInfo } from '@/type/textSelection';

interface UseTextSelectionReturn {
  selection: ISelectionInfo | null;
  clearSelection: () => void;
}

const DEBOUNCE_DELAY = 50;
const TOOLTIP_OFFSET = { x: 10, y: -5 };

export function useTextSelection(): UseTextSelectionReturn {
  const { state, setState } = useExtension();

  const timeoutRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // Helper functions
  const clearState = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectionInfo: null
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

      // Update selection info
      setState(prev => ({
        ...prev,
        selectionInfo: selectionData,
      }));

    } catch (error) {
      console.error('Selection processing failed:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [getSelectionData, clearState, setState]);

  const handleSelectionChange = useCallback(() => {
    clearTimeout();
    timeoutRef.current = window.setTimeout(processSelection, DEBOUNCE_DELAY);
  }, [clearTimeout, processSelection]);

  const clearSelection = useCallback(() => {
    clearTimeout();
    clearState();

    // Clear browser selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, [clearTimeout, clearState]);

  // Event listeners
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      clearTimeout();
    };
  }, [handleSelectionChange, clearTimeout]);

  return {
    selection: state.selectionInfo,
    clearSelection,
  };
}