import { useEffect, useCallback, useRef } from 'react';
import { preloadRoutes, addResourceHints, measurePageLoad, monitorMemoryUsage } from '@/components/performance/LoadingOptimization';

export function usePerformance() {
  // Initialize performance optimizations
  useEffect(() => {
    // Add resource hints for faster loading
    addResourceHints();
    
    // Start performance monitoring
    measurePageLoad();
    monitorMemoryUsage();
    
    // Preload critical routes after initial load
    const timer = setTimeout(() => {
      preloadRoutes();
    }, 2000); // Wait 2 seconds after initial load
    
    return () => clearTimeout(timer);
  }, []);

  // Function to preload specific routes
  const preloadRoute = useCallback((routePath: string) => {
    // Map route paths to their import functions
    const routeMap: Record<string, () => Promise<any>> = {
      '/dashboard': () => import('@/pages/Dashboard'),
      '/properties': () => import('@/pages/Properties'),
      '/portfolio': () => import('@/pages/Portfolio'),
      '/analytics': () => import('@/pages/AdvancedAnalytics'),
      '/trading': () => import('@/pages/Trading'),
      '/profile': () => import('@/pages/Profile'),
      '/admin': () => import('@/pages/AdminDashboard'),
    };

    const importFn = routeMap[routePath];
    if (importFn) {
      importFn();
    }
  }, []);

  // Function to measure component render time
  const measureRender = useCallback((componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} render time:`, end - start, 'ms');
    };
  }, []);

  // Function to check if user is on a slow connection
  const isSlowConnection = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType === 'slow-2g' || 
             connection.effectiveType === '2g' || 
             connection.effectiveType === '3g';
    }
    return false;
  }, []);

  // Function to optimize images based on connection
  const getImageQuality = useCallback(() => {
    return isSlowConnection() ? 'low' : 'high';
  }, [isSlowConnection]);

  return {
    preloadRoute,
    measureRender,
    isSlowConnection,
    getImageQuality,
  };
}

// Hook for intersection observer to lazy load components
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });

    return () => observer.disconnect();
  }, [callback, options]);

  return useCallback((node: Element | null) => {
    if (node) {
      const observer = new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      });
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [callback, options]);
}

// Hook for debouncing expensive operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
}

// Hook for throttling frequent operations
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
}