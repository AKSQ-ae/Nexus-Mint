import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isOptional?: boolean;
}

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  variant?: 'horizontal' | 'vertical';
  className?: string;
  onStepClick?: (stepId: string) => void;
}

export function OnboardingProgress({ 
  steps, 
  variant = 'horizontal', 
  className,
  onStepClick 
}: OnboardingProgressProps) {
  const isHorizontal = variant === 'horizontal';
  
  return (
    <div className={cn(
      "nexus-onboarding-progress",
      isHorizontal ? "flex items-center justify-between" : "flex flex-col space-y-4",
      className
    )}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isClickable = onStepClick && (step.isCompleted || step.isCurrent);
        
        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center group",
              isHorizontal ? "flex-1" : "w-full",
              isClickable && "cursor-pointer hover:opacity-80"
            )}
            onClick={() => isClickable && onStepClick(step.id)}
          >
            {/* Step Circle */}
            <div className="flex items-center">
              <div className={cn(
                "relative flex items-center justify-center rounded-full border-2 transition-all duration-300",
                step.isCompleted 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : step.isCurrent
                    ? "bg-background border-primary text-primary animate-pulse"
                    : "bg-muted border-muted-foreground text-muted-foreground",
                isHorizontal ? "w-8 h-8" : "w-10 h-10"
              )}>
                {step.isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3 fill-current" />
                )}
                
                {/* Pulse ring for current step */}
                {step.isCurrent && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                )}
              </div>
              
              {/* Step Info */}
              <div className={cn(
                "ml-3",
                isHorizontal && "hidden sm:block"
              )}>
                <div className={cn(
                  "font-medium text-sm transition-colors",
                  step.isCompleted || step.isCurrent 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}>
                  {step.title}
                  {step.isOptional && (
                    <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                  )}
                </div>
                {step.description && !isHorizontal && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Line */}
            {!isLast && isHorizontal && (
              <div className="flex-1 mx-4">
                <div className="h-0.5 bg-muted relative overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-primary transition-all duration-500",
                      step.isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              </div>
            )}
            
            {!isLast && !isHorizontal && (
              <div className="ml-5 mt-2 mb-2">
                <div className="w-0.5 h-8 bg-muted relative overflow-hidden">
                  <div 
                    className={cn(
                      "w-full bg-primary transition-all duration-500",
                      step.isCompleted ? "h-full" : "h-0"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Pre-defined step configurations for common flows
export const KYC_STEPS: Omit<OnboardingStep, 'isCompleted' | 'isCurrent'>[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Basic details to get started'
  },
  {
    id: 'identity-verification',
    title: 'Identity Verification',
    description: 'Upload your ID document'
  },
  {
    id: 'address-verification',
    title: 'Address Verification',
    description: 'Confirm your residence'
  },
  {
    id: 'financial-profile',
    title: 'Financial Profile',
    description: 'Investment experience and preferences'
  },
  {
    id: 'review-submit',
    title: 'Review & Submit',
    description: 'Final check before submission'
  }
];

export const INVESTMENT_STEPS: Omit<OnboardingStep, 'isCompleted' | 'isCurrent'>[] = [
  {
    id: 'property-selection',
    title: 'Select Property',
    description: 'Choose your investment opportunity'
  },
  {
    id: 'investment-amount',
    title: 'Investment Amount',
    description: 'Decide how much to invest'
  },
  {
    id: 'payment-method',
    title: 'Payment Method',
    description: 'Choose how to fund your investment'
  },
  {
    id: 'confirm-invest',
    title: 'Confirm Investment',
    description: 'Review and complete your investment'
  }
];

export const SIGNUP_STEPS: Omit<OnboardingStep, 'isCompleted' | 'isCurrent'>[] = [
  {
    id: 'account-creation',
    title: 'Create Account',
    description: 'Set up your Nexus Mint account'
  },
  {
    id: 'email-verification',
    title: 'Verify Email',
    description: 'Confirm your email address'
  },
  {
    id: 'profile-setup',
    title: 'Profile Setup',
    description: 'Tell us about yourself'
  },
  {
    id: 'welcome',
    title: 'Welcome!',
    description: 'You\'re ready to start investing'
  }
];