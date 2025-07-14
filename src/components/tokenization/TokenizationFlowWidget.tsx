import React, { useState } from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenizationStep {
  id: number;
  label: string;
  description: string;
}

interface TokenizationFlowWidgetProps {
  currentStep?: number;
  steps?: TokenizationStep[];
  className?: string;
}

const defaultSteps: TokenizationStep[] = [
  { id: 1, label: 'Property Acquired', description: 'Property verification and documentation completed' },
  { id: 2, label: 'Sharia Certification', description: 'Islamic compliance verification in progress' },
  { id: 3, label: 'NFT Minted', description: 'Unique property NFT creation' },
  { id: 4, label: 'ERC-20 Issued', description: 'Fractional tokens generated' },
  { id: 5, label: 'Marketplace Listed', description: 'Available for investment' },
];

export function TokenizationFlowWidget({ 
  currentStep = 3, 
  steps = defaultSteps,
  className 
}: TokenizationFlowWidgetProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'complete';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepId: number) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'active':
        return <Clock className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStepStyles = (stepId: number) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case 'complete':
        return 'bg-primary text-primary-foreground border-primary';
      case 'active':
        return 'bg-accent text-accent-foreground border-accent animate-pulse';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getConnectorStyles = (stepId: number) => {
    return stepId < currentStep ? 'bg-primary' : 'bg-muted';
  };

  return (
    <div className={cn("p-6 bg-card rounded-2xl border shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        <h3 className="text-lg font-semibold text-card-foreground">
          Tokenization Flow - AI TOKO
        </h3>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const isHovered = hoveredStep === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Step Node */}
                <div 
                  className="relative flex flex-col items-center group"
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div
                    className={cn(
                      "relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer",
                      getStepStyles(step.id)
                    )}
                  >
                    {getStepIcon(step.id)}
                    
                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{step.id}</span>
                    </div>
                  </div>
                  
                  {/* Step label */}
                  <div className="mt-3 text-center">
                    <div className="text-sm font-medium text-foreground mb-1">
                      {step.label}
                    </div>
                    <div className={cn(
                      "text-xs text-muted-foreground transition-all duration-200",
                      isHovered && "text-foreground"
                    )}>
                      {status === 'complete' && 'Completed'}
                      {status === 'active' && 'In Progress'}
                      {status === 'pending' && 'Pending'}
                    </div>
                  </div>

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-4 z-10 animate-fade-in">
                      <div className="bg-popover text-popover-foreground text-sm rounded-lg py-2 px-3 shadow-md border whitespace-nowrap max-w-48 text-center">
                        {step.description}
                      </div>
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover mx-auto mt-1" />
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-4 relative">
                    <div className="h-0.5 bg-muted rounded-full"></div>
                    <div 
                      className={cn(
                        "absolute top-0 left-0 h-0.5 rounded-full transition-all duration-500",
                        getConnectorStyles(step.id)
                      )}
                      style={{ 
                        width: step.id < currentStep ? '100%' : '0%' 
                      }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}