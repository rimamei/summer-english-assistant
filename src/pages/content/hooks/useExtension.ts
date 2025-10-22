import { useContext } from 'react';
import { ExtensionContext } from '../context/ExtensionContext';
import type { ExtensionContextType } from '../context/ExtensionContext';

// Custom hook to use the extension context
export function useExtension(): ExtensionContextType {
  const context = useContext(ExtensionContext);
  if (!context) {
    throw new Error('useExtension must be used within an ExtensionProvider');
  }
  return context;
}