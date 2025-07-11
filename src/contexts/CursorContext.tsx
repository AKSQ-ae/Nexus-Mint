import React, { createContext, useContext, useState, useEffect } from 'react';

interface CursorContextType {
  isEnabled: boolean;
  toggleCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('nexus-cursor-enabled');
    return saved ? JSON.parse(saved) : true; // Default to enabled
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