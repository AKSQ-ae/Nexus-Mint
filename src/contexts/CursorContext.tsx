import React, { createContext, useContext, useState, useEffect } from 'react';

interface CursorContextType {
  isEnabled: boolean;
  toggleCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false;
    
    // Check if device supports hover (desktop/laptop)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (!supportsHover) return false;
    
    // Check localStorage preference
    const saved = localStorage.getItem('nexus-cursor-enabled');
    return saved !== null ? JSON.parse(saved) : true; // Default to enabled on desktop
  });

  const toggleCursor = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('nexus-cursor-enabled', JSON.stringify(newState));
  };

  useEffect(() => {
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus-cursor-enabled', JSON.stringify(isEnabled));
    }
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