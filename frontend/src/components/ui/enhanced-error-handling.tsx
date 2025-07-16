import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ErrorDisplayProps {
  title: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showDetails?: boolean;
  variant?: 'inline' | 'card' | 'banner';
  className?: string;
}

export function ErrorDisplay({ 
  title, 
  message, 
  details, 
  onRetry, 
  retryLabel = "Try Again",
  showDetails = false,
  variant = 'inline',
  className 
}: ErrorDisplayProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const ErrorContent = () => (
    <>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-800">{title}</h4>
          <p className="text-red-700 mt-1">{message}</p>
          
          {details && showDetails && (
            <div className="mt-3">
              <button
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                {detailsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {detailsExpanded ? 'Hide' : 'Show'} Details
              </button>
              
              {detailsExpanded && (
                <div className="mt-2 p-3 bg-red-50 rounded border text-sm text-red-800 font-mono">
                  {details}
                </div>
              )}
            </div>
          )}
          
          {onRetry && (
            <div className="mt-4">
              <Button 
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (variant === 'card') {
    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <CardContent className="p-6">
          <ErrorContent />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn('p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
        <ErrorContent />
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <ErrorContent />
    </Alert>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <ErrorDisplay
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection."
      onRetry={onRetry}
      retryLabel="Retry Connection"
      variant="card"
      className={className}
    />
  );
}

interface ValidationErrorProps {
  errors: string[];
  className?: string;
}

export function ValidationError({ errors, className }: ValidationErrorProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

interface TransactionErrorProps {
  error: string;
  txHash?: string;
  onRetry?: () => void;
  className?: string;
}

export function TransactionError({ error, txHash, onRetry, className }: TransactionErrorProps) {
  return (
    <ErrorDisplay
      title="Transaction Failed"
      message={error}
      details={txHash ? `Transaction Hash: ${txHash}` : undefined}
      onRetry={onRetry}
      retryLabel="Retry Transaction"
      showDetails={!!txHash}
      variant="card"
      className={className}
    />
  );
}