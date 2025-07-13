import React, { createContext, useContext, useState, useEffect } from 'react';

interface CursorContextType {
  isEnabled: boolean;
  toggleCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false); // Start with false to prevent hydration mismatch
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize state on client side only
    if (typeof window !== 'undefined') {
      // Check if device supports hover (desktop/laptop)
      const supportsHover = window.matchMedia('(hover: hover)').matches;
      if (!supportsHover) {
        setIsEnabled(false);
        setIsInitialized(true);
        return;
      }
      
      // Check localStorage preference
      const saved = localStorage.getItem('nexus-cursor-enabled');
      const preferredState = saved !== null ? JSON.parse(saved) : true; // Default to enabled on desktop
      setIsEnabled(preferredState);
      setIsInitialized(true);
    }
  }, []);

  const toggleCursor = () => {
    if (!isInitialized) return; // Prevent toggle before initialization
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus-cursor-enabled', JSON.stringify(newState));
    }
  };

  // Remove the second useEffect since we handle localStorage in toggleCursor now

  return (
    <CursorContext.Provider value={{ isEnabled: isInitialized && isEnabled, toggleCursor }}>
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