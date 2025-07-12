import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  lazy = true,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
  quality = 85,
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Show placeholder while loading
  if (!isInView || hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-muted animate-pulse ${className}`}
        style={{ 
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      >
        {hasError && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Failed to load image
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${className}`}
        />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        srcSet={isInView ? generateSrcSet(src) : undefined}
        sizes={sizes}
        alt={alt}
        className={`transition-opacity duration-300 ${className} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  );
}

// Hook for preloading critical images
export function useImagePreload(imageSources: string[]) {
  useEffect(() => {
    const preloadImages = imageSources.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    return () => {
      preloadImages.forEach(img => {
        img.src = '';
      });
    };
  }, [imageSources]);
}

// Component for progressive image enhancement
export function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  className = '',
  ...props
}: Omit<OptimizedImageProps, 'src'> & {
  lowQualitySrc: string;
  highQualitySrc: string;
}) {
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHighQualityLoaded(true);
    img.src = highQualitySrc;
  }, [highQualitySrc]);

  return (
    <OptimizedImage
      src={highQualityLoaded ? highQualitySrc : lowQualitySrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
}