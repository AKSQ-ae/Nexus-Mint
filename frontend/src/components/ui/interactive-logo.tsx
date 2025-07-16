import { useState, useEffect, useRef } from 'react';

interface InteractiveLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export function InteractiveLogo({ src, alt, className = "" }: InteractiveLogoProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (logoRef.current && isHovered) {
        const rect = logoRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate distance and angle from logo center to cursor
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        // Limit movement to a reasonable range
        const maxMove = 8;
        const moveX = Math.max(-maxMove, Math.min(maxMove, deltaX * 0.1));
        const moveY = Math.max(-maxMove, Math.min(maxMove, deltaY * 0.1));
        
        setMousePosition({ x: moveX, y: moveY });
      }
    };

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={logoRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain transition-all duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${isHovered ? 1.1 : 1})`,
          filter: isHovered ? 'brightness(1.1) saturate(1.2) drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' : 'none',
        }}
      />
      
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-coral/20 rounded-lg opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
        }}
      />
      
      {/* Animated particles */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-1 h-1 bg-coral rounded-full animate-ping"
            style={{
              top: '20%',
              left: '20%',
              animationDelay: '0s',
            }}
          />
          <div
            className="absolute w-1 h-1 bg-bright-blue rounded-full animate-ping"
            style={{
              top: '70%',
              right: '20%',
              animationDelay: '0.5s',
            }}
          />
          <div
            className="absolute w-1 h-1 bg-navy-blue rounded-full animate-ping"
            style={{
              bottom: '20%',
              left: '70%',
              animationDelay: '1s',
            }}
          />
        </div>
      )}
    </div>
  );
}