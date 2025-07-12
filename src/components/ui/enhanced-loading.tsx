import React from 'react';
import { Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  );
}

interface ProcessStepProps {
  title: string;
  description?: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  className?: string;
}

export function ProcessStep({ title, description, status, className }: ProcessStepProps) {
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner size="sm" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border', className)}>
      <div className="mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className={cn('font-medium', getStatusColor())}>
          {title}
        </h4>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
  submessage?: string;
  progress?: number;
}

export function LoadingOverlay({ isVisible, message, submessage, progress }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="text-center space-y-4 p-6">
        <LoadingSpinner size="lg" />
        <div>
          <h3 className="font-semibold text-lg">{message}</h3>
          {submessage && (
            <p className="text-muted-foreground mt-1">{submessage}</p>
          )}
        </div>
        {progress !== undefined && (
          <div className="w-64 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}