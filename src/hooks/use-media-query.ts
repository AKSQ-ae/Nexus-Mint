import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Define the event handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    media.addEventListener('change', handler);

    // Clean up
    return () => {
      media.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}