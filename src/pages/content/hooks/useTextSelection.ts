import { useState, useEffect, useCallback } from 'react';

interface SelectionInfo {
  text: string;
  position: { x: number; y: number };
  range: Range | null;
}

interface UseTextSelectionReturn {
  selection: SelectionInfo | null;
  clearSelection: () => void;
}

export function useTextSelection(): UseTextSelectionReturn {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);


  // Only set selection on mouseup for smoother UX
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setSelection(null);
      return;
    }
    const selectedText = sel.toString().trim();
    if (selectedText.length === 0) {
      setSelection(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const position = {
      x: rect.right + 10,
      y: rect.top - 5,
    };
    setSelection({
      text: selectedText,
      position,
      range: range.cloneRange(),
    });
  }, []);

  // Only clear selection on selectionchange if nothing is selected
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().trim().length === 0) {
      setSelection(null);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    // Also clear the browser selection
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
    }
  }, []);

  useEffect(() => {
    // Listen for selection changes to clear selection if needed
    document.addEventListener('selectionchange', handleSelectionChange);
    // Listen for mouseup to set selection
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleSelectionChange, handleMouseUp]);

  // Clear selection when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      // Small delay to allow for proper selection handling
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.toString().trim().length === 0) {
          setSelection(null);
        }
      }, 10);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return {
    selection,
    clearSelection,
  };
}