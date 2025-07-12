import React, { useEffect, useState } from 'react';

interface TapEffect {
  id: number;
  x: number;
  y: number;
}

export const TapAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tapEffects, setTapEffects] = useState<TapEffect[]>([]);

  useEffect(() => {
    let tapId = 0;

    const handleTap = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

      if (clientX === undefined || clientY === undefined) return;

      const newTap: TapEffect = {
        id: tapId++,
        x: clientX,
        y: clientY,
      };

      setTapEffects(prev => [...prev, newTap]);

      // Remove the effect after animation completes
      setTimeout(() => {
        setTapEffects(prev => prev.filter(tap => tap.id !== newTap.id));
      }, 1000);
    };

    // Add event listeners for both mouse and touch
    document.addEventListener('mousedown', handleTap);
    document.addEventListener('touchstart', handleTap);

    return () => {
      document.removeEventListener('mousedown', handleTap);
      document.removeEventListener('touchstart', handleTap);
    };
  }, []);

  return (
    <div className="relative">
      {children}
      {/* Tap effects overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {tapEffects.map((tap) => (
          <div
            key={tap.id}
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{
              left: tap.x,
              top: tap.y,
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              borderRadius: '50%',
              animation: 'tap-ripple 1s ease-out forwards',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Add the custom animation to global CSS
const tapRippleAnimation = `
  @keyframes tap-ripple {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      transform: translate(-50%, -50%) scale(4);
      opacity: 0;
    }
  }
`;

// Inject the animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = tapRippleAnimation;
  document.head.appendChild(style);
}