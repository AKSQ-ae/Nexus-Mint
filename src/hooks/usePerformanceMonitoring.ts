import { useEffect, useCallback } from 'react';
import { captureMessage } from '@/lib/sentry';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface NavigationTiming {
  dns: number;
  connection: number;
  response: number;
  dom: number;
  load: number;
}

export function usePerformanceMonitoring() {
  const measurePerformance = useCallback(() => {
    // Core Web Vitals measurement
    if ('web-vitals' in window) {
      // This would be imported from 'web-vitals' library in a real implementation
      return;
    }

    // Manual performance measurement
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          const timing: NavigationTiming = {
            dns: nav.domainLookupEnd - nav.domainLookupStart,
            connection: nav.connectEnd - nav.connectStart,
            response: nav.responseEnd - nav.requestStart,
            dom: nav.domContentLoadedEventEnd - nav.responseEnd,
            load: nav.loadEventEnd - nav.loadEventStart,
          };

          // Log performance metrics
          console.log('Navigation Timing:', timing);
          
          // Report slow navigation
          if (timing.load > 3000) {
            captureMessage(`Slow page load: ${timing.load}ms`, 'warning');
          }
        }

        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          console.log('LCP:', lcp);
          
          if (lcp > 2500) {
            captureMessage(`Poor LCP: ${lcp}ms`, 'warning');
          }
        }

        if (entry.entryType === 'first-input') {
          const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          console.log('FID:', fid);
          
          if (fid > 100) {
            captureMessage(`Poor FID: ${fid}ms`, 'warning');
          }
        }

        if (entry.entryType === 'layout-shift') {
          const cls = (entry as any).value;
          console.log('CLS:', cls);
          
          if (cls > 0.1) {
            captureMessage(`Poor CLS: ${cls}`, 'warning');
          }
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

    return () => observer.disconnect();
  }, []);

  const measureResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const slowResources = resources.filter(resource => 
      resource.duration > 1000 && resource.name.includes('.js')
    );

    if (slowResources.length > 0) {
      slowResources.forEach(resource => {
        captureMessage(`Slow resource load: ${resource.name} (${resource.duration}ms)`, 'warning');
      });
    }

    // Measure total bundle size
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    if (totalJSSize > 500000) { // 500KB
      captureMessage(`Large JS bundle size: ${(totalJSSize / 1024).toFixed(2)}KB`, 'warning');
    }
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };

      // Convert to MB
      const usedMB = memoryUsage.used / 1048576;
      const totalMB = memoryUsage.total / 1048576;

      console.log(`Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);

      // Alert if memory usage is high
      if (usedMB > 100) {
        captureMessage(`High memory usage: ${usedMB.toFixed(2)}MB`, 'warning');
      }
    }
  }, []);

  const measureLongTasks = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            captureMessage(`Long task detected: ${entry.duration}ms`, 'warning');
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      return () => observer.disconnect();
    }
  }, []);

  const measureCustomMetrics = useCallback((name: string, value: number) => {
    performance.mark(`${name}-start`);
    
    setTimeout(() => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration}ms`);
      
      // Clean up
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    }, value);
  }, []);

  // Performance budget monitoring
  const checkPerformanceBudget = useCallback(() => {
    const budget = {
      maxLoadTime: 3000,
      maxLCP: 2500,
      maxFID: 100,
      maxCLS: 0.1,
      maxJSBundleSize: 500000, // 500KB
    };

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

    const violations = [];
    
    if (loadTime > budget.maxLoadTime) {
      violations.push(`Load time: ${loadTime}ms (budget: ${budget.maxLoadTime}ms)`);
    }

    if (violations.length > 0) {
      captureMessage(`Performance budget violations: ${violations.join(', ')}`, 'warning');
    }
  }, []);

  useEffect(() => {
    const cleanup = measurePerformance();
    const longTaskCleanup = measureLongTasks();
    
    // Measure resource timing after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        measureResourceTiming();
        measureMemoryUsage();
        checkPerformanceBudget();
      }, 1000);
    });

    // Monitor memory usage periodically
    const memoryInterval = setInterval(measureMemoryUsage, 30000);

    return () => {
      cleanup?.();
      longTaskCleanup?.();
      clearInterval(memoryInterval);
    };
  }, [measurePerformance, measureLongTasks, measureResourceTiming, measureMemoryUsage, checkPerformanceBudget]);

  return {
    measureCustomMetrics,
    measureMemoryUsage,
    measureResourceTiming,
    checkPerformanceBudget,
  };
}

// Hook for component-specific performance monitoring
export function useComponentPerformance(componentName: string) {
  const startTime = performance.now();

  useEffect(() => {
    const mountTime = performance.now() - startTime;
    console.log(`${componentName} mount time: ${mountTime.toFixed(2)}ms`);
    
    if (mountTime > 100) {
      captureMessage(`Slow component mount: ${componentName} (${mountTime.toFixed(2)}ms)`, 'warning');
    }

    return () => {
      const unmountTime = performance.now();
      console.log(`${componentName} was mounted for: ${(unmountTime - startTime).toFixed(2)}ms`);
    };
  }, [componentName, startTime]);
}