import React from 'react';
import * as Sentry from '@sentry/react';

const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  },
  {
    fallback: ({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full bg-card p-6 rounded-lg border shadow-lg text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">
            We've been notified about this error and are working to fix it.
          </p>
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Error Details
            </summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
          <div className="space-y-2">
            <button
              onClick={resetError}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo as any);
    },
  }
);

export default SentryErrorBoundary;