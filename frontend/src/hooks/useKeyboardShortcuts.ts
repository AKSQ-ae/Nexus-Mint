import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
  const navigate = useNavigate();

  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      action: () => navigate('/'),
      description: 'Go to Home'
    },
    {
      key: 'p',
      action: () => navigate('/properties'),
      description: 'View Properties'
    },
    {
      key: 'o',
      action: () => navigate('/portfolio'),
      description: 'View Portfolio'
    },
    {
      key: 'd',
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard'
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('#global-search') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus Search'
    },
    {
      key: '?',
      shiftKey: true,
      action: () => {
        // Show keyboard shortcuts modal
        console.log('Show keyboard shortcuts');
      },
      description: 'Show Keyboard Shortcuts'
    }
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      const shortcut = allShortcuts.find(s => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = (s.ctrlKey || false) === event.ctrlKey;
        const metaMatch = (s.metaKey || false) === event.metaKey;
        const shiftMatch = (s.shiftKey || false) === event.shiftKey;
        
        return keyMatch && ctrlMatch && metaMatch && shiftMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allShortcuts]);

  return { shortcuts: allShortcuts };
}