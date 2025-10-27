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

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    
    if (!sel || sel.rangeCount === 0) {
      setSelection(null);
      return;
    }

    const selectedText = sel.toString().trim();
    
    // Only process if there's actual selected text (not just cursor position)
    if (selectedText.length === 0) {
      setSelection(null);
      return;
    }

    // Get the range and calculate position
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Position the translation icon near the end of the selection
    const position = {
      x: rect.right + 10, // Slightly to the right of selection
      y: rect.top - 5,    // Slightly above selection
    };

    console.log('Text selected:', selectedText, 'at position:', position);

    setSelection({
      text: selectedText,
      position,
      range: range.cloneRange(),
    });
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
    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Also listen for mouse up to catch selection end
    document.addEventListener('mouseup', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Clear selection when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If clicking on our extension elements, don't clear selection
      const target = e.target as Element;
      if (target.closest('[data-summer-extension]')) {
        return;
      }
      
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