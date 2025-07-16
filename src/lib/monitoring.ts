import { createComponentLogger } from './logger';
import { eventBus, EventTypes } from './eventBus';

const logger = createComponentLogger('Monitoring');

// Monitoring Configuration Types
interface MonitoringConfig {
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableBusinessMetrics: boolean;
  enableHealthChecks: boolean;
  sampleRate: number; // 0-1
  reportingInterval: number; // milliseconds
  alertThresholds: AlertThresholds;
}

interface AlertThresholds {
  errorRate: number; // percentage
  responseTime: number; // milliseconds
  memoryUsage: number; // percentage
  conversionRate: number; // percentage drop
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

interface BusinessMetric {
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram';
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

interface Alert {
  id: string;
  type: 'performance' | 'error' | 'business' | 'health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

// Advanced Monitoring System
class MonitoringSystem {
  private static instance: MonitoringSystem;
  private config: MonitoringConfig;
  private performanceMetrics: PerformanceMetric[] = [];
  private businessMetrics: BusinessMetric[] = [];
  private healthChecks = new Map<string, HealthCheck>();
  private alerts: Alert[] = [];
  private observers: PerformanceObserver[] = [];
  private reportingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableBusinessMetrics: true,
      enableHealthChecks: true,
      sampleRate: 0.1, // 10% sampling
      reportingInterval: 30000, // 30 seconds
      alertThresholds: {
        errorRate: 5, // 5%
        responseTime: 3000, // 3 seconds
        memoryUsage: 80, // 80%
        conversionRate: 20 // 20% drop
      }
    };

    this.initialize();
  }

  static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    this.setupPerformanceTracking();
    this.setupErrorTracking();
    this.setupBusinessMetrics();
    this.setupHealthChecks();
    this.startReporting();

    logger.info('Monitoring system initialized');
  }

  // Performance Tracking
  private setupPerformanceTracking(): void {
    if (!this.config.enablePerformanceTracking) return;

    // Navigation timing
    this.trackNavigationMetrics();

    // Core Web Vitals
    this.trackCoreWebVitals();

    // Resource timing
    this.trackResourceMetrics();

    // Custom performance markers
    this.setupCustomMarkers();
  }

  private trackNavigationMetrics(): void {
    if (!('performance' in window) || !performance.getEntriesByType) return;

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length === 0) return;

    const navigation = navigationEntries[0];
    
    this.recordMetric('navigation.domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
    this.recordMetric('navigation.loadComplete', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
    this.recordMetric('navigation.firstPaint', navigation.responseStart - navigation.fetchStart, 'ms');
    this.recordMetric('navigation.domComplete', navigation.domComplete - navigation.domLoading, 'ms');
  }

  private trackCoreWebVitals(): void {
    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.recordMetric('webvitals.cls', (entry as any).value, 'score');
          }
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        logger.warn('CLS observation not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('webvitals.fid', (entry as any).processingStart - entry.startTime, 'ms');
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        logger.warn('FID observation not supported');
      }
    }

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('webvitals.lcp', lastEntry.startTime, 'ms');
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        logger.warn('LCP observation not supported');
      }
    }
  }

  private trackResourceMetrics(): void {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resource.duration > 1000) {
          this.recordMetric('resource.slow', resource.duration, 'ms', {
            name: resource.name,
            type: resource.initiatorType
          });
        }

        // Track large resources
        if (resource.transferSize > 1000000) { // 1MB
          this.recordMetric('resource.large', resource.transferSize, 'bytes', {
            name: resource.name,
            type: resource.initiatorType
          });
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      logger.warn('Resource observation not supported');
    }
  }

  private setupCustomMarkers(): void {
    // Mark key application events
    const markEvent = (name: string) => {
      if ('performance' in window && performance.mark) {
        performance.mark(name);
      }
    };

    // Listen for important events
    eventBus.on(EventTypes.INVESTMENT_COMPLETED, () => markEvent('investment-completed'));
    eventBus.on(EventTypes.PROPERTY_VIEWED, () => markEvent('property-viewed'));
    eventBus.on(EventTypes.USER_REGISTERED, () => markEvent('user-registered'));
  }

  // Error Tracking
  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;

    window.addEventListener('error', (event) => {
      this.recordError('javascript', event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('promise', event.reason, {
        type: 'unhandled_promise_rejection'
      });
    });

    // Track React errors via event bus
    eventBus.on(EventTypes.SYSTEM_ERROR, (event) => {
      this.recordError('react', event.payload.error, event.payload.context);
    });
  }

  private recordError(type: string, error: any, context?: any): void {
    this.recordMetric('error.count', 1, 'count', { type });
    
    // Check error rate threshold
    const recentErrors = this.performanceMetrics
      .filter(m => m.name === 'error.count' && Date.now() - m.timestamp.getTime() < 60000)
      .length;

    if (recentErrors > this.config.alertThresholds.errorRate) {
      this.createAlert('error', 'high', `High error rate: ${recentErrors} errors in last minute`, {
        type,
        error: error.toString(),
        context
      });
    }
  }

  // Business Metrics
  private setupBusinessMetrics(): void {
    if (!this.config.enableBusinessMetrics) return;

    // Investment metrics
    eventBus.on(EventTypes.INVESTMENT_COMPLETED, (event) => {
      this.recordBusinessMetric('investment.completion', 1, 'counter', {
        amount: event.payload.amount,
        propertyId: event.payload.propertyId
      });
    });

    eventBus.on(EventTypes.INVESTMENT_STARTED, () => {
      this.recordBusinessMetric('investment.started', 1, 'counter');
    });

    // User engagement metrics
    eventBus.on(EventTypes.PROPERTY_VIEWED, () => {
      this.recordBusinessMetric('property.views', 1, 'counter');
    });

    eventBus.on(EventTypes.PROPERTY_FAVORITED, () => {
      this.recordBusinessMetric('property.favorites', 1, 'counter');
    });

    // Conversion rate monitoring
    this.trackConversionRate();
  }

  private trackConversionRate(): void {
    const calculateConversionRate = () => {
      const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();

      const startedInvestments = this.businessMetrics
        .filter(m => m.name === 'investment.started' && now - m.timestamp.getTime() < timeWindow)
        .length;

      const completedInvestments = this.businessMetrics
        .filter(m => m.name === 'investment.completion' && now - m.timestamp.getTime() < timeWindow)
        .length;

      const conversionRate = startedInvestments > 0 ? (completedInvestments / startedInvestments) * 100 : 0;
      
      this.recordBusinessMetric('conversion.rate', conversionRate, 'gauge');

      // Alert on significant drop
      const previousPeriodStart = now - (2 * timeWindow);
      const previousStarted = this.businessMetrics
        .filter(m => m.name === 'investment.started' && 
          m.timestamp.getTime() >= previousPeriodStart && 
          m.timestamp.getTime() < (now - timeWindow))
        .length;

      const previousCompleted = this.businessMetrics
        .filter(m => m.name === 'investment.completion' && 
          m.timestamp.getTime() >= previousPeriodStart && 
          m.timestamp.getTime() < (now - timeWindow))
        .length;

      const previousConversionRate = previousStarted > 0 ? (previousCompleted / previousStarted) * 100 : 0;
      
      if (previousConversionRate > 0 && conversionRate < previousConversionRate * (1 - this.config.alertThresholds.conversionRate / 100)) {
        this.createAlert('business', 'high', `Conversion rate dropped from ${previousConversionRate.toFixed(1)}% to ${conversionRate.toFixed(1)}%`, {
          current: conversionRate,
          previous: previousConversionRate
        });
      }
    };

    // Calculate every hour
    setInterval(calculateConversionRate, 60 * 60 * 1000);
  }

  // Health Checks
  private setupHealthChecks(): void {
    if (!this.config.enableHealthChecks) return;

    // API health check
    this.registerHealthCheck('api', async () => {
      const start = Date.now();
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          cache: 'no-cache'
        });
        const responseTime = Date.now() - start;
        
        if (response.ok) {
          return {
            status: 'healthy' as const,
            responseTime,
            details: { statusCode: response.status }
          };
        } else {
          return {
            status: 'degraded' as const,
            responseTime,
            message: `API returned ${response.status}`,
            details: { statusCode: response.status }
          };
        }
      } catch (error) {
        return {
          status: 'unhealthy' as const,
          responseTime: Date.now() - start,
          message: 'API unreachable',
          details: { error: error.toString() }
        };
      }
    });

    // Database health check
    this.registerHealthCheck('database', async () => {
      const start = Date.now();
      try {
        // Simple query to test database connectivity
        const response = await fetch('/api/db-health');
        const responseTime = Date.now() - start;
        
        if (response.ok) {
          const data = await response.json();
          return {
            status: 'healthy' as const,
            responseTime,
            details: data
          };
        } else {
          return {
            status: 'unhealthy' as const,
            responseTime,
            message: 'Database check failed'
          };
        }
      } catch (error) {
        return {
          status: 'unhealthy' as const,
          responseTime: Date.now() - start,
          message: 'Database unreachable',
          details: { error: error.toString() }
        };
      }
    });

    // Memory health check
    this.registerHealthCheck('memory', async () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
        
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        if (usagePercent > 90) status = 'unhealthy';
        else if (usagePercent > 70) status = 'degraded';
        
        return {
          status,
          responseTime: 0,
          details: {
            usedMB: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
            totalMB: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024),
            usagePercent: Math.round(usagePercent)
          }
        };
      }
      
      return {
        status: 'healthy' as const,
        responseTime: 0,
        message: 'Memory info not available'
      };
    });

    // Run health checks every 30 seconds
    setInterval(() => this.runHealthChecks(), 30000);
  }

  // Core Methods
  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    if (!this.shouldSample()) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    };

    this.performanceMetrics.push(metric);
    this.maintainMetricsSize();

    // Check thresholds
    this.checkPerformanceThresholds(metric);
  }

  recordBusinessMetric(name: string, value: number, type: BusinessMetric['type'], metadata?: Record<string, any>): void {
    const metric: BusinessMetric = {
      name,
      value,
      type,
      timestamp: new Date(),
      metadata
    };

    this.businessMetrics.push(metric);
    this.maintainMetricsSize();
  }

  registerHealthCheck(name: string, checkFn: () => Promise<Omit<HealthCheck, 'name' | 'timestamp'>>): void {
    const check = async () => {
      try {
        const result = await checkFn();
        const healthCheck: HealthCheck = {
          name,
          ...result,
          timestamp: new Date()
        };
        
        this.healthChecks.set(name, healthCheck);
        
        if (result.status !== 'healthy') {
          this.createAlert('health', result.status === 'unhealthy' ? 'critical' : 'medium', 
            `Health check ${name} is ${result.status}`, result);
        }
      } catch (error) {
        const healthCheck: HealthCheck = {
          name,
          status: 'unhealthy',
          responseTime: 0,
          message: 'Health check failed',
          details: { error: error.toString() },
          timestamp: new Date()
        };
        
        this.healthChecks.set(name, healthCheck);
        this.createAlert('health', 'critical', `Health check ${name} failed`, { error });
      }
    };

    // Run initial check
    check();
  }

  private async runHealthChecks(): Promise<void> {
    // Health checks are now automatically run by their individual timers
    // This method can be used for on-demand health check runs
  }

  createAlert(type: Alert['type'], severity: Alert['severity'], message: string, data: any): void {
    const alert: Alert = {
      id: this.generateId(),
      type,
      severity,
      message,
      data,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(alert);
    
    logger.warn('Alert created', alert);
    
    // Emit alert event
    eventBus.emit(EventTypes.SYSTEM_WARNING, alert);
    
    // Send to external alerting system
    this.sendAlert(alert);
  }

  private sendAlert(alert: Alert): void {
    // Send to external monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'monitoring_alert', {
        alert_type: alert.type,
        severity: alert.severity,
        message: alert.message
      });
    }
  }

  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    if (metric.name.includes('response') && metric.value > this.config.alertThresholds.responseTime) {
      this.createAlert('performance', 'medium', `Slow response time: ${metric.value}ms`, metric);
    }
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private maintainMetricsSize(maxSize: number = 10000): void {
    if (this.performanceMetrics.length > maxSize) {
      this.performanceMetrics = this.performanceMetrics.slice(-maxSize);
    }
    if (this.businessMetrics.length > maxSize) {
      this.businessMetrics = this.businessMetrics.slice(-maxSize);
    }
  }

  private startReporting(): void {
    this.reportingInterval = setInterval(() => {
      this.generateReport();
    }, this.config.reportingInterval);
  }

  private generateReport(): void {
    const report = {
      performance: this.getPerformanceReport(),
      business: this.getBusinessReport(),
      health: this.getHealthReport(),
      alerts: this.getActiveAlerts()
    };

    logger.debug('Monitoring report generated', report);
    
    // Send report to analytics
    eventBus.emit('monitoring.report', report);
  }

  // Public API
  getPerformanceReport(): any {
    const recent = this.performanceMetrics.filter(m => 
      Date.now() - m.timestamp.getTime() < this.config.reportingInterval
    );

    return {
      totalMetrics: recent.length,
      avgResponseTime: this.calculateAverage(recent.filter(m => m.name.includes('response')), 'value'),
      errorRate: recent.filter(m => m.name === 'error.count').length,
      coreWebVitals: {
        lcp: this.getLatestMetric(recent, 'webvitals.lcp')?.value,
        fid: this.getLatestMetric(recent, 'webvitals.fid')?.value,
        cls: this.getLatestMetric(recent, 'webvitals.cls')?.value
      }
    };
  }

  getBusinessReport(): any {
    const recent = this.businessMetrics.filter(m => 
      Date.now() - m.timestamp.getTime() < this.config.reportingInterval
    );

    return {
      conversions: recent.filter(m => m.name === 'investment.completion').length,
      propertyViews: recent.filter(m => m.name === 'property.views').length,
      conversionRate: this.getLatestMetric(recent, 'conversion.rate')?.value
    };
  }

  getHealthReport(): Record<string, HealthCheck> {
    const healthMap: Record<string, HealthCheck> = {};
    this.healthChecks.forEach((check, name) => {
      healthMap[name] = check;
    });
    return healthMap;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  private calculateAverage(metrics: PerformanceMetric[], field: keyof PerformanceMetric): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + (m[field] as number), 0);
    return sum / metrics.length;
  }

  private getLatestMetric(metrics: PerformanceMetric[], name: string): PerformanceMetric | null {
    const filtered = metrics.filter(m => m.name === name);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }

  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }
  }
}

// Global monitoring instance
export const monitoring = MonitoringSystem.getInstance();

// React Hook for Monitoring
export function useMonitoring() {
  const recordMetric = React.useCallback((name: string, value: number, unit: string, tags?: Record<string, string>) => {
    monitoring.recordMetric(name, value, unit, tags);
  }, []);

  const recordBusinessMetric = React.useCallback((name: string, value: number, type: BusinessMetric['type'], metadata?: Record<string, any>) => {
    monitoring.recordBusinessMetric(name, value, type, metadata);
  }, []);

  const createAlert = React.useCallback((type: Alert['type'], severity: Alert['severity'], message: string, data: any) => {
    monitoring.createAlert(type, severity, message, data);
  }, []);

  return {
    recordMetric,
    recordBusinessMetric,
    createAlert,
    getPerformanceReport: () => monitoring.getPerformanceReport(),
    getBusinessReport: () => monitoring.getBusinessReport(),
    getHealthReport: () => monitoring.getHealthReport(),
    getActiveAlerts: () => monitoring.getActiveAlerts()
  };
}

// Performance measurement decorator
export function measurePerformance(metricName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = performance.now() - start;
        monitoring.recordMetric(metricName, duration, 'ms');
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        monitoring.recordMetric(metricName + '.error', duration, 'ms');
        throw error;
      }
    };

    return descriptor;
  };
}

// Component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      const start = performance.now();
      monitoring.recordMetric(`component.${componentName}.mount`, performance.now() - start, 'ms');

      return () => {
        monitoring.recordMetric(`component.${componentName}.unmount`, performance.now() - start, 'ms');
      };
    }, []);

    return <Component ref={ref} {...props} />;
  });
}

export { MonitoringSystem };