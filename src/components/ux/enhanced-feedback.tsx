import React from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Info, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type FeedbackType = 'success' | 'error' | 'info' | 'loading' | 'warning';

export interface FeedbackAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  external?: boolean;
}

interface EnhancedFeedbackProps {
  type: FeedbackType;
  title: string;
  message: string;
  nextStep?: string;
  actions?: FeedbackAction[];
  className?: string;
  onDismiss?: () => void;
  autoHide?: number; // milliseconds
  showIcon?: boolean;
}

export function EnhancedFeedback({
  type,
  title,
  message,
  nextStep,
  actions,
  className,
  onDismiss,
  autoHide,
  showIcon = true
}: EnhancedFeedbackProps) {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHide);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  const iconMap = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
    loading: Loader2
  };

  const colorMap = {
    success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
    loading: 'border-muted bg-muted/50 text-foreground'
  };

  const iconColorMap = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    loading: 'text-muted-foreground'
  };

  const Icon = iconMap[type];

  return (
    <Card className={cn(
      "nexus-feedback transition-all duration-300 animate-fade-in",
      colorMap[type],
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className={cn(
              "flex-shrink-0 mt-0.5",
              iconColorMap[type]
            )}>
              <Icon className={cn(
                "h-5 w-5",
                type === 'loading' && "animate-spin"
              )} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-1">
              {title}
            </div>
            
            <div className="text-sm opacity-90 mb-2">
              {message}
            </div>
            
            {nextStep && (
              <div className="flex items-center gap-2 text-xs opacity-75 mb-3">
                <ArrowRight className="h-3 w-3" />
                <span>Next: {nextStep}</span>
              </div>
            )}
            
            {actions && actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    size="sm"
                    onClick={action.onClick}
                    className="h-8 text-xs"
                  >
                    {action.label}
                    {action.external && (
                      <ExternalLink className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-built feedback messages for common scenarios
export const FEEDBACK_MESSAGES = {
  // Authentication & Onboarding
  accountCreated: {
    type: 'success' as FeedbackType,
    title: '✅ Welcome to the Nexus Mint Family!',
    message: 'Your account has been created successfully. You\'re now part of our growing community of smart investors.',
    nextStep: 'Complete your profile to unlock investment opportunities'
  },
  
  emailVerified: {
    type: 'success' as FeedbackType,
    title: '✅ Email Verified!',
    message: 'Great! Your email has been confirmed. You can now access all platform features.',
    nextStep: 'Start your KYC process to begin investing'
  },
  
  kycSubmitted: {
    type: 'success' as FeedbackType,
    title: '✅ KYC Documents Submitted',
    message: 'Thank you for providing your documents. Our team will review them within 24-48 hours.',
    nextStep: 'We\'ll notify you once verification is complete'
  },
  
  kycApproved: {
    type: 'success' as FeedbackType,
    title: '🎉 KYC Approved - You\'re Investment Ready!',
    message: 'Congratulations! Your identity has been verified. You can now invest in tokenized properties.',
    nextStep: 'Browse our curated property marketplace'
  },
  
  // Investment Process
  walletConnected: {
    type: 'success' as FeedbackType,
    title: '✅ Wallet Connected',
    message: 'Your Web3 wallet is now linked to your account. You can use crypto for investments.',
    nextStep: 'Choose your payment method for investments'
  },
  
  investmentCalculated: {
    type: 'info' as FeedbackType,
    title: '📊 Investment Preview Ready',
    message: 'We\'ve calculated your potential returns and fees. Review the details below.',
    nextStep: 'Proceed to payment to secure your investment'
  },
  
  paymentProcessing: {
    type: 'loading' as FeedbackType,
    title: '⏳ Processing Your Investment',
    message: 'We\'re securely processing your payment and allocating your property tokens.',
    nextStep: 'This usually takes 30-60 seconds'
  },
  
  investmentComplete: {
    type: 'success' as FeedbackType,
    title: '🏡 Investment Successful!',
    message: 'Congratulations! You now own a piece of premium real estate. Welcome to smart property investing.',
    nextStep: 'View your portfolio to track performance'
  },
  
  // Errors & Recovery
  networkError: {
    type: 'error' as FeedbackType,
    title: '🌐 Connection Issue',
    message: 'We\'re having trouble connecting to our servers. Please check your internet connection.',
    nextStep: 'Try refreshing the page or contact support if the issue persists'
  },
  
  insufficientFunds: {
    type: 'warning' as FeedbackType,
    title: '💰 Insufficient Balance',
    message: 'Your wallet doesn\'t have enough funds for this investment. Consider adjusting the amount.',
    nextStep: 'Add funds to your wallet or reduce your investment amount'
  },
  
  kycRequired: {
    type: 'info' as FeedbackType,
    title: '🆔 Verification Required',
    message: 'To comply with regulations, we need to verify your identity before you can invest.',
    nextStep: 'Complete the quick KYC process (takes 5-10 minutes)'
  },
  
  // Success Milestones
  firstInvestment: {
    type: 'success' as FeedbackType,
    title: '🌟 Your First Investment Milestone!',
    message: 'Amazing! You\'ve taken your first step into the future of real estate investing.',
    nextStep: 'Set up notifications to track your property\'s performance'
  },
  
  portfolioMilestone: {
    type: 'success' as FeedbackType,
    title: '🎯 Portfolio Milestone Achieved!',
    message: 'You\'ve reached a significant milestone in your investment journey. Keep building!',
    nextStep: 'Consider diversifying across different property types'
  }
};

// Helper hook for managing feedback state
export function useFeedback() {
  const [feedback, setFeedback] = React.useState<(EnhancedFeedbackProps & { id: string }) | null>(null);

  const showFeedback = React.useCallback((props: Omit<EnhancedFeedbackProps, 'onDismiss'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setFeedback({
      ...props,
      id,
      onDismiss: () => setFeedback(null)
    });
  }, []);

  const hideFeedback = React.useCallback(() => {
    setFeedback(null);
  }, []);

  const showSuccess = React.useCallback((title: string, message: string, options?: Partial<EnhancedFeedbackProps>) => {
    showFeedback({ type: 'success', title, message, ...options });
  }, [showFeedback]);

  const showError = React.useCallback((title: string, message: string, options?: Partial<EnhancedFeedbackProps>) => {
    showFeedback({ type: 'error', title, message, ...options });
  }, [showFeedback]);

  const showInfo = React.useCallback((title: string, message: string, options?: Partial<EnhancedFeedbackProps>) => {
    showFeedback({ type: 'info', title, message, ...options });
  }, [showFeedback]);

  const showLoading = React.useCallback((title: string, message: string, options?: Partial<EnhancedFeedbackProps>) => {
    showFeedback({ type: 'loading', title, message, ...options });
  }, [showFeedback]);

  return {
    feedback,
    showFeedback,
    hideFeedback,
    showSuccess,
    showError,
    showInfo,
    showLoading
  };
}