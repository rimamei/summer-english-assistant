import { useEffect, useRef, useCallback } from 'react';

interface UseClickOutsideProps {
  isOpen: boolean;
  onClose: () => void;
  isDragging?: boolean;
}

export function useClickOutside({ isOpen, onClose, isDragging = false }: UseClickOutsideProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    
    // Don't close if currently dragging
    if (isDragging) {
      return;
    }

    // Don't close if clicking on the modal or its children
    if (ref.current && ref.current.contains(target)) {
      return;
    }

    // Don't close if clicking on extension elements (including tooltips, etc.)
    if (target.closest('[data-summer-extension]')) {
      return;
    }

    // Check if there's currently selected text (user might be selecting)
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    // Close the modal
    onClose();
  }, [onClose, isDragging]);

  useEffect(() => {
    if (!isOpen) return;

    // Use click instead of mousedown to avoid interfering with text selection
    // Add delay to prevent immediate closure when modal opens
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick, true);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isOpen, handleClick]);

  return ref;
}