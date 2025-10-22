import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ExtensionState {
  mode: 'highlight' | 'screenshot';
  showModeModal: boolean;
  showTranslationModal: boolean;
  translationText: string;
  translationPosition: { x: number; y: number };
}

export interface ExtensionContextType {
  state: ExtensionState;
  setState: React.Dispatch<React.SetStateAction<ExtensionState>>;
}

const initialState: ExtensionState = {
  mode: 'highlight',
  showModeModal: true,
  showTranslationModal: false,
  translationText: '',
  translationPosition: { x: 0, y: 0 },
};

// eslint-disable-next-line react-refresh/only-export-components
export const ExtensionContext = createContext<ExtensionContextType | undefined>(
  undefined
);

interface ExtensionProviderProps {
  children: ReactNode;
}

export function ExtensionProvider({ children }: ExtensionProviderProps) {
  const [state, setState] = useState<ExtensionState>(initialState);

  return (
    <ExtensionContext.Provider value={{ state, setState }}>
      {children}
    </ExtensionContext.Provider>
  );
}
