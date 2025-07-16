import { Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Loading skeletons for different components
export function PropertyCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-48 w-full rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Higher-order component for lazy loading with custom skeleton
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  SkeletonComponent: ComponentType = () => <Skeleton className="h-64 w-full" />
) {
  return function LazyComponent(props: T) {
    return (
      <Suspense fallback={<SkeletonComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Preloader for critical route components
export function preloadRoutes() {
  // Preload critical routes in the background
  const criticalRoutes = [
    () => import('@/pages/Dashboard'),
    () => import('@/pages/Properties'),
    () => import('@/pages/Portfolio'),
    () => import('@/pages/AdvancedAnalytics'),
    () => import('@/pages/Trading')
  ];

  // Use requestIdleCallback for non-blocking preloading
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      criticalRoutes.forEach(route => route());
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      criticalRoutes.forEach(route => route());
    }, 1000);
  }
}

// Resource hints for performance
export function addResourceHints() {
  const head = document.head;

  // DNS prefetch for external resources
  const dnsPrefetch = [
    'https://api.supabase.io',
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
  ];

  dnsPrefetch.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    head.appendChild(link);
  });

  // Preconnect to critical origins
  const preconnect = [
    'https://api.supabase.io',
    'https://fonts.gstatic.com',
  ];

  preconnect.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });
}

// Bundle optimization utilities
export function registerServiceWorkerUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New service worker is active, recommend refresh
      if (confirm('New version available! Refresh to update?')) {
        window.location.reload();
      }
    });
  }
}

// Performance monitoring utilities
export function measurePageLoad() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.loadEventStart);
        console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      }
    });
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
        console.warn('High memory usage detected:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
        });
      }
    }, 30000); // Check every 30 seconds
  }
}