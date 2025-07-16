import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps?: string[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps = [],
  className,
  orientation = 'horizontal',
  size = 'md'
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  const getStepStatus = (stepId: string, index: number) => {
    if (completedSteps.includes(stepId) || index < currentIndex) {
      return 'completed';
    }
    if (stepId === currentStep) {
      return 'current';
    }
    return 'pending';
  };

  const sizeClasses = {
    sm: {
      circle: 'h-6 w-6',
      text: 'text-xs',
      gap: 'gap-2'
    },
    md: {
      circle: 'h-8 w-8',
      text: 'text-sm',
      gap: 'gap-3'
    },
    lg: {
      circle: 'h-10 w-10',
      text: 'text-base',
      gap: 'gap-4'
    }
  };

  const currentSizeClasses = sizeClasses[size];

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start">
              {/* Connecting Line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-px h-8 bg-border" />
              )}

              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 flex-shrink-0',
                  currentSizeClasses.circle,
                  status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                  status === 'current' && 'bg-background border-primary text-primary animate-pulse',
                  status === 'pending' && 'bg-background border-muted-foreground text-muted-foreground'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : status === 'current' ? (
                  step.icon || <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1">
                <h4
                  className={cn(
                    'font-medium',
                    currentSizeClasses.text,
                    status === 'current' && 'text-primary',
                    status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </h4>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.id, index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className={cn('flex flex-col items-center', currentSizeClasses.gap)}>
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 flex-shrink-0',
                  currentSizeClasses.circle,
                  status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                  status === 'current' && 'bg-background border-primary text-primary animate-pulse',
                  status === 'pending' && 'bg-background border-muted-foreground text-muted-foreground'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : status === 'current' ? (
                  step.icon || <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>

              {/* Step Label */}
              <div className="text-center">
                <p
                  className={cn(
                    'font-medium',
                    currentSizeClasses.text,
                    status === 'current' && 'text-primary',
                    status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-20">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connecting Line */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-px bg-border mx-4',
                  status === 'completed' && 'bg-primary'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Investment flow steps
export const investmentSteps = [
  { id: 'calculator', label: 'Calculate', description: 'Set investment amount' },
  { id: 'kyc', label: 'Verify', description: 'Identity verification' },
  { id: 'payment', label: 'Pay', description: 'Secure payment' },
  { id: 'confirmation', label: 'Complete', description: 'Investment confirmed' }
];

// Tokenization flow steps
export const tokenizationSteps = [
  { id: 'audit', label: 'Audit', description: 'Property validation' },
  { id: 'contract', label: 'Deploy', description: 'Smart contract' },
  { id: 'verification', label: 'Verify', description: 'Contract verification' },
  { id: 'launch', label: 'Launch', description: 'Go live' },
  { id: 'monitoring', label: 'Monitor', description: 'Real-time tracking' }
];