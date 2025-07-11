import { useEffect, useRef } from 'react';
import { useCursor } from '@/contexts/CursorContext';

export function CustomCursor() {
  const { isEnabled } = useCursor();
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEnabled || window.innerWidth <= 768) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Mouse tracking - account for centered transform
    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    // Add hover interactions to interactive elements
    const addInteractions = () => {
      const hoverElements = document.querySelectorAll('button, a, input, textarea, [role="button"], .clickable');
      
      hoverElements.forEach(element => {
        const handleMouseEnter = () => cursor.classList.add('hover');
        const handleMouseLeave = () => cursor.classList.remove('hover');
        const handleMouseDown = () => cursor.classList.add('click');
        const handleMouseUp = () => cursor.classList.remove('click');

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
      const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
      
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
      document.querySelectorAll('[data-cursor-interactive]').forEach(el => {
        if ((el as any)._cursorCleanup) {
          (el as any)._cursorCleanup();
        }
        if ((el as any)._cursorTextCleanup) {
          (el as any)._cursorTextCleanup();
        }
      });
    };

    // Handle dynamic content
    const observer = new MutationObserver(() => {
      cleanupInteractions();
      addInteractions();
    });

    document.addEventListener('mousemove', handleMouseMove);
    addInteractions();
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cleanupInteractions();
      observer.disconnect();
    };
  }, [isEnabled]);

  if (!isEnabled || window.innerWidth <= 768) return null;

  return (
    <>
      <style>{`
        ${isEnabled ? '* { cursor: none !important; }' : ''}
        
        .nexus-cursor {
          position: fixed;
          width: 18px;
          height: 18px;
          pointer-events: none;
          z-index: 999999;
          transform: translate(-50%, -50%) rotate(-25deg) skewX(-15deg);
          transition: all 0.15s ease;
        }

        .nexus-cursor svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 6px rgba(30, 144, 255, 0.5));
          transform: scaleX(0.85);
        }

        .nexus-cursor.hover {
          transform: translate(-50%, -50%) rotate(-25deg) skewX(-15deg) scale(1.3);
          filter: brightness(1.2);
        }

        .nexus-cursor.click {
          transform: translate(-50%, -50%) rotate(-25deg) skewX(-15deg) scale(0.8);
          filter: brightness(1.5);
        }

        .nexus-cursor.text {
          transform: translate(-50%, -50%) rotate(-25deg) skewX(-15deg) scale(0.6);
          opacity: 0.8;
        }
      `}</style>
      
      <div className="nexus-cursor" ref={cursorRef}>
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1E90FF' }} />
              <stop offset="100%" style={{ stopColor: '#4169E1' }} />
            </linearGradient>
          </defs>
          <path 
            d="M2 18V2h2.5l8 10.5V2H15v16h-2.5L4.5 7.5V18H2z" 
            fill="url(#nexusGradient)" 
            stroke="#ffffff" 
            strokeWidth="0.3"
          />
        </svg>
      </div>
    </>
  );
}