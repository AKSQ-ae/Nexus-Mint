import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createComponentLogger } from '@/lib/logger';

const logger = createComponentLogger('ErrorBoundary');

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'section' | 'component';
  name?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  maxRetries?: number;
  isolateErrors?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  goHome: () => void;
  reportError: () => void;
  level: 'page' | 'section' | 'component';
  name?: string;
  retryCount: number;
  maxRetries: number;
  showErrorDetails: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  goHome,
  reportError,
  level,
  name,
  retryCount,
  maxRetries,
  showErrorDetails
}) => {
  const getErrorTitle = () => {
    switch (level) {
      case 'page':
        return 'Page Error';
      case 'section':
        return 'Section Unavailable';
      case 'component':
        return 'Component Error';
      default:
        return 'Something went wrong';
    }
  };

  const getErrorDescription = () => {
    switch (level) {
      case 'page':
        return 'This page encountered an error and cannot be displayed properly.';
      case 'section':
        return 'This section is temporarily unavailable due to an error.';
      case 'component':
        return 'A component has encountered an error and cannot be displayed.';
      default:
        return 'We\'ve encountered an unexpected error.';
    }
  };

  const getErrorIcon = () => {
    switch (level) {
      case 'page':
        return <AlertTriangle className="h-12 w-12 text-destructive" />;
      case 'section':
        return <AlertTriangle className="h-8 w-8 text-destructive" />;
      case 'component':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-destructive" />;
    }
  };

  const canRetry = retryCount < maxRetries;

  return (
    <div className={`flex items-center justify-center p-4 ${level === 'page' ? 'min-h-screen' : ''}`}>
      <Card className={`w-full ${level === 'page' ? 'max-w-lg' : level === 'section' ? 'max-w-md' : 'max-w-sm'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-lg">
            {getErrorTitle()}
            {name && ` - ${name}`}
          </CardTitle>
          <CardDescription>
            {getErrorDescription()}
            {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {showErrorDetails && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium text-sm">
                    Technical Details
                  </summary>
                  <div className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {error.stack.slice(0, 500)}...
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {errorInfo.componentStack.slice(0, 300)}...
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            {canRetry && (
              <Button 
                onClick={resetError}
                variant="default"
                className="flex-1"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {level === 'page' && (
              <Button 
                onClick={goHome}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>

          <Button 
            onClick={reportError}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            Report Issue
          </Button>

          {!canRetry && (
            <p className="text-xs text-muted-foreground text-center">
              Maximum retry attempts reached. Please refresh the page or contact support.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { name, level = 'component', onError } = this.props;
    
    // Log the error
    logger.error('Error boundary caught error', error, {
      name,
      level,
      errorInfo,
      retryCount: this.state.retryCount,
      componentStack: errorInfo.componentStack
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in custom error handler', handlerError);
      }
    }

    // Report to error tracking service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope((scope) => {
        scope.setTag('errorBoundary', true);
        scope.setTag('errorBoundaryLevel', level);
        scope.setTag('errorBoundaryName', name || 'unknown');
        scope.setContext('errorInfo', errorInfo);
        scope.setContext('retryCount', this.state.retryCount);
        window.Sentry.captureException(error);
      });
    }
  }

  resetError = () => {
    const { maxRetries = 3 } = this.props;
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount <= maxRetries) {
      logger.info('Resetting error boundary', { 
        retryCount: newRetryCount,
        name: this.props.name 
      });

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: newRetryCount
      });
    }
  };

  goHome = () => {
    logger.info('Navigating to home from error boundary');
    window.location.href = '/';
  };

  reportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const { name, level } = this.props;

    logger.businessEvent('Error reported by user', {
      errorId,
      name,
      level,
      errorMessage: error?.message
    });

    // Create email with error details
    const subject = encodeURIComponent(`Error Report - ${name || 'Component'}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Component: ${name || 'Unknown'}
Level: ${level}
Error: ${error?.message || 'Unknown error'}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Additional context:
${errorInfo?.componentStack || 'No component stack available'}
    `);

    window.open(`mailto:support@nexusmint.com?subject=${subject}&body=${body}`);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { 
      children, 
      fallback, 
      level = 'component', 
      name,
      showErrorDetails = false,
      maxRetries = 3,
      isolateErrors = true
    } = this.props;

    if (this.state.hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Use default error fallback
      return (
        <ErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          goHome={this.goHome}
          reportError={this.reportError}
          level={level}
          name={name}
          retryCount={this.state.retryCount}
          maxRetries={maxRetries}
          showErrorDetails={showErrorDetails}
        />
      );
    }

    // Wrap children with isolation if enabled
    if (isolateErrors) {
      return (
        <div style={{ isolation: 'isolate' }}>
          {children}
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorHandler() {
  const reportError = (error: Error, context?: Record<string, unknown>) => {
    logger.error('Manual error report', error, context);
    
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: context });
    }
  };

  return { reportError };
}

// Specialized error boundaries for different use cases
export const PageErrorBoundary: React.FC<{ children: ReactNode; name?: string }> = ({ children, name }) => (
  <EnhancedErrorBoundary 
    level="page" 
    name={name}
    showErrorDetails={!import.meta.env.PROD}
    maxRetries={2}
  >
    {children}
  </EnhancedErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ children: ReactNode; name?: string }> = ({ children, name }) => (
  <EnhancedErrorBoundary 
    level="section" 
    name={name}
    showErrorDetails={false}
    maxRetries={3}
  >
    {children}
  </EnhancedErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; name?: string }> = ({ children, name }) => (
  <EnhancedErrorBoundary 
    level="component" 
    name={name}
    showErrorDetails={false}
    maxRetries={1}
  >
    {children}
  </EnhancedErrorBoundary>
);

export default EnhancedErrorBoundary;