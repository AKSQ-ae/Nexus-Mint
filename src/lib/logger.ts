interface LogLevel {
  TRACE: 0;
  DEBUG: 1;
  INFO: 2;
  WARN: 3;
  ERROR: 4;
  FATAL: 5;
}

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  error?: Error | unknown;
}

class Logger {
  private static instance: Logger;
  private logLevel: keyof LogLevel;
  private context: Record<string, unknown> = {};

  private constructor() {
    this.logLevel = import.meta.env.PROD ? 'INFO' : 'DEBUG';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      context: { ...this.context, ...entry.context }
    });
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: LogLevel = { TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, FATAL: 5 };
    return levels[level] >= levels[this.logLevel];
  }

  private createLogEntry(
    level: keyof LogLevel, 
    message: string, 
    context?: Record<string, unknown>,
    error?: Error | unknown
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      userId: this.context.userId as string,
      sessionId: this.context.sessionId as string
    };
  }

  trace(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('TRACE')) return;
    const entry = this.createLogEntry('TRACE', message, context);
    console.trace(this.formatLog(entry));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('DEBUG')) return;
    const entry = this.createLogEntry('DEBUG', message, context);
    console.debug(this.formatLog(entry));
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('INFO')) return;
    const entry = this.createLogEntry('INFO', message, context);
    console.info(this.formatLog(entry));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('WARN')) return;
    const entry = this.createLogEntry('WARN', message, context);
    console.warn(this.formatLog(entry));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (!this.shouldLog('ERROR')) return;
    const entry = this.createLogEntry('ERROR', message, context, error);
    console.error(this.formatLog(entry));
    
    // Send to error tracking in production
    if (import.meta.env.PROD && typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error instanceof Error ? error : new Error(message), {
        extra: context
      });
    }
  }

  fatal(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('FATAL', message, context, error);
    console.error(this.formatLog(entry));
    
    // Always send fatal errors to tracking
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error instanceof Error ? error : new Error(message), {
        level: 'fatal',
        extra: context
      });
    }
  }

  // Performance logging
  performance(operation: string, duration: number, context?: Record<string, unknown>): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      duration: `${duration}ms`,
      type: 'performance'
    });
  }

  // Business event logging
  businessEvent(event: string, context?: Record<string, unknown>): void {
    this.info(`Business Event: ${event}`, {
      ...context,
      type: 'business_event'
    });
  }

  // Security event logging
  securityEvent(event: string, context?: Record<string, unknown>): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      type: 'security_event'
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Helper function for component-specific loggers
export function createComponentLogger(componentName: string) {
  return {
    trace: (message: string, context?: Record<string, unknown>) => 
      logger.trace(`[${componentName}] ${message}`, context),
    debug: (message: string, context?: Record<string, unknown>) => 
      logger.debug(`[${componentName}] ${message}`, context),
    info: (message: string, context?: Record<string, unknown>) => 
      logger.info(`[${componentName}] ${message}`, context),
    warn: (message: string, context?: Record<string, unknown>) => 
      logger.warn(`[${componentName}] ${message}`, context),
    error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => 
      logger.error(`[${componentName}] ${message}`, error, context),
    fatal: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => 
      logger.fatal(`[${componentName}] ${message}`, error, context),
    performance: (operation: string, duration: number, context?: Record<string, unknown>) => 
      logger.performance(`[${componentName}] ${operation}`, duration, context),
    businessEvent: (event: string, context?: Record<string, unknown>) => 
      logger.businessEvent(`[${componentName}] ${event}`, context),
    securityEvent: (event: string, context?: Record<string, unknown>) => 
      logger.securityEvent(`[${componentName}] ${event}`, context)
  };
}

// Development helper for measuring performance
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>,
  componentName?: string
): T | Promise<T> {
  const start = performance.now();
  const log = componentName ? createComponentLogger(componentName) : logger;
  
  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then((value) => {
        const duration = performance.now() - start;
        log.performance(operation, duration);
        return value;
      }).catch((error) => {
        const duration = performance.now() - start;
        log.error(`${operation} failed`, error, { duration: `${duration}ms` });
        throw error;
      });
    } else {
      const duration = performance.now() - start;
      log.performance(operation, duration);
      return result;
    }
  } catch (error) {
    const duration = performance.now() - start;
    log.error(`${operation} failed`, error, { duration: `${duration}ms` });
    throw error;
  }
}