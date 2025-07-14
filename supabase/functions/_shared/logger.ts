/**
 * Enhanced logging utilities for edge functions
 * Provides structured logging with context and severity levels
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  functionName: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext) {
    this.context = context;
  }

  private log(level: LogLevel, step: string, details?: any, error?: Error) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      function: this.context.functionName,
      step,
      context: this.context,
      details,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    };

    console.log(`[${timestamp}] [${level}] [${this.context.functionName}] ${step}`, 
      details ? `- ${JSON.stringify(details)}` : '');
    
    return logEntry;
  }

  debug(step: string, details?: any) {
    return this.log('DEBUG', step, details);
  }

  info(step: string, details?: any) {
    return this.log('INFO', step, details);
  }

  warn(step: string, details?: any) {
    return this.log('WARN', step, details);
  }

  error(step: string, error?: Error, details?: any) {
    return this.log('ERROR', step, details, error);
  }

  updateContext(updates: Partial<LogContext>) {
    this.context = { ...this.context, ...updates };
  }
}

export const createLogger = (functionName: string, userId?: string) => {
  return new Logger({
    functionName,
    userId,
    requestId: crypto.randomUUID()
  });
};