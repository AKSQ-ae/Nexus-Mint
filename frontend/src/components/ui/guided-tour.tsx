import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector or element ID
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function GuidedTour({ 
  steps, 
  isOpen, 
  onClose, 
  onComplete,
  autoStart = false 
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && steps[currentStep]?.target) {
      const element = document.querySelector(steps[currentStep].target!) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.position = 'relative';
        element.style.zIndex = '1000';
        element.style.boxShadow = '0 0 0 4px hsl(var(--primary) / 0.3)';
        element.style.borderRadius = '8px';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.boxShadow = '';
        targetElement.style.zIndex = '';
        targetElement.style.position = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, isOpen, steps, targetElement]);

  const nextStep = () => {
    if (steps[currentStep]?.action) {
      steps[currentStep].action!();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
    setCurrentStep(0);
  };

  const skipTour = () => {
    onClose();
    setCurrentStep(0);
  };

  if (!isOpen || !steps.length) return null;

  const current = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      
      {/* Tour Card */}
      <Card className="fixed z-50 max-w-sm p-6 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={skipTour}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h3 className="font-semibold text-lg mb-2">{current.title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{current.content}</p>

        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipTour}
            >
              Skip Tour
            </Button>
            <Button 
              size="sm" 
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 1000;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.3);
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}

// Hook for managing guided tours
export function useGuidedTour(tourId: string, steps: TourStep[]) {
  const [isOpen, setIsOpen] = useState(false);

  const startTour = () => {
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
    localStorage.setItem(`tour-completed-${tourId}`, 'true');
  };

  const isCompleted = () => {
    return localStorage.getItem(`tour-completed-${tourId}`) === 'true';
  };

  const resetTour = () => {
    localStorage.removeItem(`tour-completed-${tourId}`);
  };

  return {
    isOpen,
    startTour,
    closeTour,
    isCompleted,
    resetTour,
    TourComponent: (props: Partial<GuidedTourProps>) => (
      <GuidedTour 
        steps={steps}
        isOpen={isOpen}
        onClose={closeTour}
        {...props}
      />
    )
  };
}