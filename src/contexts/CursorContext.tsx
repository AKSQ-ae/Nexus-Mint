import React, { createContext, useContext, useState, useEffect } from 'react';

interface CursorContextType {
  isEnabled: boolean;
  toggleCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Force enable cursor by default - ignore any previous localStorage
    localStorage.setItem('nexus-cursor-enabled', JSON.stringify(true));
    return true;
  });

  const toggleCursor = () => {
    setIsEnabled(!isEnabled);
  };

  useEffect(() => {
    localStorage.setItem('nexus-cursor-enabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  return (
    <CursorContext.Provider value={{ isEnabled, toggleCursor }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
}