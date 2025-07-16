import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { captureError, captureMessage } from '@/lib/sentry';

export const useSentryIntegration = () => {
  const testSentryIntegration = () => {
    try {
      // Test error capture
      captureMessage('Sentry integration test', 'info');
      
      // Test exception capture
      const testError = new Error('Test error for Sentry validation');
      testError.name = 'SentryIntegrationTest';
      captureError(testError, {
        test: true,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      
      console.log('✅ Sentry integration test completed');
      return true;
    } catch (error) {
      console.error('❌ Sentry integration test failed:', error);
      return false;
    }
  };

  const setupSentryPerformanceMonitoring = () => {
    // Track navigation performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: 'Page Load Performance',
          data: {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          },
          level: 'info',
        });
      }
    }
  };

  const setupSentryUserContext = () => {
    // This would typically get user info from your auth system
    // For now, we'll set anonymous tracking
    Sentry.setUser({
      id: 'anonymous',
      segment: 'early-access',
    });

    Sentry.setTag('environment', import.meta.env.MODE);
    Sentry.setTag('version', '1.0.0');
  };

  const setupSentryErrorBoundary = () => {
    // Global error handler for unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        captureError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
          type: 'unhandledrejection',
          reason: event.reason,
        });
      });
    }
  };

  useEffect(() => {
    setupSentryUserContext();
    setupSentryPerformanceMonitoring();
    setupSentryErrorBoundary();
    
    // Run integration test in development
    if (import.meta.env.DEV) {
      setTimeout(() => {
        testSentryIntegration();
      }, 2000);
    }
  }, []);

  return {
    testSentryIntegration,
    captureError,
    captureMessage,
  };
};