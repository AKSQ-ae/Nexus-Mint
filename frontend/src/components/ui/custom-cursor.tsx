import { useEffect, useRef } from 'react';
import { useCursor } from '@/contexts/CursorContext';

export function CustomCursor() {
  const { isEnabled } = useCursor();
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop devices with proper cursor support
    if (!isEnabled || typeof window === 'undefined') return;
    
    // Check if device supports hover (desktop/laptop)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (!supportsHover) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    // Handle mouse enter/leave document
    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    // Add hover interactions to interactive elements
    const addInteractions = () => {
      const hoverElements = document.querySelectorAll(
        'button, a, input, textarea, select, [role="button"], [role="link"], .clickable, .cursor-pointer'
      );
      
      hoverElements.forEach(element => {
        const handleMouseEnter = () => {
          cursor.classList.add('hover');
        };
        
        const handleMouseLeave = () => {
          cursor.classList.remove('hover', 'click');
        };
        
        const handleMouseDown = () => {
          cursor.classList.add('click');
        };
        
        const handleMouseUp = () => {
          cursor.classList.remove('click');
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('mouseup', handleMouseUp);

        // Store cleanup functions
        (element as any)._cursorCleanup = () => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('mousedown', handleMouseDown);
          element.removeEventListener('mouseup', handleMouseUp);
        };
      });

      // Text input interactions
      const textInputs = document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="password"], input[type="search"], textarea'
      );
      
      textInputs.forEach(input => {
        const handleFocus = () => cursor.classList.add('text');
        const handleBlur = () => cursor.classList.remove('text');

        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);

        (input as any)._cursorTextCleanup = () => {
          input.removeEventListener('focus', handleFocus);
          input.removeEventListener('blur', handleBlur);
        };
      });
    };

    // Clean up existing interactions
    const cleanupInteractions = () => {
      document.querySelectorAll('*').forEach(el => {
        if ((el as any)._cursorCleanup) {
          (el as any)._cursorCleanup();
        }
        if ((el as any)._cursorTextCleanup) {
          (el as any)._cursorTextCleanup();
        }
      });
    };

    // Handle dynamic content with throttled observer
    let observerTimeout: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(() => {
        addInteractions();
      }, 100);
    });

    // Initialize
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    addInteractions();
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });

    return () => {
      // Restore default cursor
      document.body.style.cursor = '';
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cleanupInteractions();
      observer.disconnect();
      clearTimeout(observerTimeout);
    };
  }, [isEnabled]);

  // Don't render on devices that don't support hover
  if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
    return null;
  }

  if (!isEnabled) return null;

  return (
    <>
      <style>{`
        .nexus-cursor {
          position: fixed;
          width: 20px;
          height: 20px;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-50%, -50%);
          transition: all 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform, opacity;
          opacity: 0;
        }

        .nexus-cursor svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 8px rgba(30, 144, 255, 0.3));
        }

        .nexus-cursor.hover {
          transform: translate(-50%, -50%) scale(1.4);
        }

        .nexus-cursor.click {
          transform: translate(-50%, -50%) scale(0.9);
          transition: all 0.05s ease;
        }

        .nexus-cursor.text {
          transform: translate(-50%, -50%) scale(0.7);
          opacity: 0.7;
        }

        /* Hide cursor on specific elements that need default behavior */
        input[type="range"], input[type="color"] {
          cursor: auto !important;
        }
      `}</style>
      
      <div className="nexus-cursor" ref={cursorRef}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1E90FF' }} />
              <stop offset="50%" style={{ stopColor: '#4169E1' }} />
              <stop offset="100%" style={{ stopColor: '#6A5ACD' }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path 
            d="M3 21V3h3l9 12V3h3v18h-3L6 9v12H3z" 
            fill="url(#nexusGradient)" 
            stroke="#ffffff" 
            strokeWidth="0.5"
            filter="url(#glow)"
          />
        </svg>
      </div>
    </>
  );
}