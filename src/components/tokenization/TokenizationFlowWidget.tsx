import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Circle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TokenizationStep {
  id: number;
  label: string;
  description: string;
}

interface PropertyTokenizationData {
  propertyId: string;
  currentStep: number;
  steps: TokenizationStep[];
  lastUpdated?: string;
  estimatedCompletion?: string;
}

interface TokenizationFlowWidgetProps {
  propertyId?: string;
  currentStep?: number;
  steps?: TokenizationStep[];
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStepClick?: (step: TokenizationStep) => void;
  compact?: boolean;
}

const defaultSteps: TokenizationStep[] = [
  { id: 1, label: 'Property Acquired', description: 'Property verification and documentation completed' },
  { id: 2, label: 'Sharia Certification', description: 'Islamic compliance verification in progress' },
  { id: 3, label: 'NFT Minted', description: 'Unique property NFT creation' },
  { id: 4, label: 'ERC-20 Issued', description: 'Fractional tokens generated' },
  { id: 5, label: 'Marketplace Listed', description: 'Available for investment' },
];

export function TokenizationFlowWidget({ 
  propertyId,
  currentStep = 3, 
  steps = defaultSteps,
  className,
  autoRefresh = false,
  refreshInterval = 30000,
  onStepClick,
  compact = false
}: TokenizationFlowWidgetProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [focusedStep, setFocusedStep] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PropertyTokenizationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lazy load data from API
  const fetchTokenizationData = async (propertyId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tokenization process data
      const { data: processData, error: processError } = await supabase
        .from('tokenization_processes')
        .select(`
          *,
          tokenization_steps(*)
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (processError) throw processError;

      if (processData) {
        // Calculate current step based on completed steps
        const completedSteps = processData.tokenization_steps?.filter(
          (step: any) => step.status === 'completed'
        ).length || 0;
        
        setData({
          propertyId,
          currentStep: Math.min(completedSteps + 1, steps.length),
          steps,
          lastUpdated: processData.updated_at,
          estimatedCompletion: processData.estimated_completion
        });
      } else {
        // No tokenization process found
        setData({
          propertyId,
          currentStep: 1,
          steps,
        });
      }
    } catch (err) {
      console.error('Error fetching tokenization data:', err);
      setError('Failed to load tokenization data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (propertyId) {
      fetchTokenizationData(propertyId);

      if (autoRefresh) {
        const interval = setInterval(() => {
          fetchTokenizationData(propertyId);
        }, refreshInterval);

        return () => clearInterval(interval);
      }
    }
  }, [propertyId, autoRefresh, refreshInterval]);

  const activeCurrentStep = data?.currentStep || currentStep;
  const activeSteps = data?.steps || steps;

  const getStepStatus = (stepId: number) => {
    if (stepId < activeCurrentStep) return 'complete';
    if (stepId === activeCurrentStep) return 'active';
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
    return stepId < activeCurrentStep ? 'bg-primary' : 'bg-muted';
  };

  const handleStepInteraction = (step: TokenizationStep) => {
    onStepClick?.(step);
  };

  const handleKeyDown = (event: React.KeyboardEvent, step: TokenizationStep) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepInteraction(step);
    }
  };

  if (loading && !data) {
    return (
      <div className={cn("p-6 bg-card rounded-2xl border shadow-sm flex items-center justify-center", className)}>
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading tokenization data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-6 bg-card rounded-2xl border shadow-sm", className)}>
        <div className="text-center">
          <div className="text-destructive mb-2">{error}</div>
          {propertyId && (
            <button
              onClick={() => fetchTokenizationData(propertyId)}
              className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(((activeCurrentStep - 1) / (activeSteps.length - 1)) * 100);

  return (
    <div 
      className={cn("p-6 bg-card rounded-2xl border shadow-sm", className)}
      role="region"
      aria-label="Tokenization Progress"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <h3 className="text-lg font-semibold text-card-foreground">
            {compact ? 'Progress' : 'Tokenization Flow - AI TOKO'}
          </h3>
        </div>
        
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
        
        {data?.lastUpdated && !compact && (
          <div className="text-xs text-muted-foreground">
            Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="relative">
        <div className={cn(
          "flex items-center",
          compact ? "justify-center" : "justify-between"
        )}>
          {activeSteps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const isHovered = hoveredStep === step.id;
            const isFocused = focusedStep === step.id;
            const isInteractive = !!onStepClick;

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
                      "relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      getStepStyles(step.id),
                      isInteractive && "hover:scale-110 cursor-pointer focus:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
                      (isHovered || isFocused) && "scale-110"
                    )}
                    onClick={() => handleStepInteraction(step)}
                    onKeyDown={(e) => handleKeyDown(e, step)}
                    onFocus={() => setFocusedStep(step.id)}
                    onBlur={() => setFocusedStep(null)}
                    tabIndex={isInteractive ? 0 : -1}
                    role={isInteractive ? "button" : undefined}
                    aria-label={`${step.label} - ${status}`}
                    aria-describedby={`step-${step.id}-tooltip`}
                  >
                    {getStepIcon(step.id)}
                    
                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{step.id}</span>
                    </div>
                  </div>
                  
                  {/* Step label */}
                  {!compact && (
                    <div className="mt-3 text-center max-w-20">
                      <div className="text-sm font-medium text-foreground mb-1 leading-tight">
                        {step.label}
                      </div>
                      <div className={cn(
                        "text-xs text-muted-foreground transition-all duration-200",
                        (isHovered || isFocused) && "text-foreground"
                      )}>
                        {status === 'complete' && 'Completed'}
                        {status === 'active' && 'In Progress'}
                        {status === 'pending' && 'Pending'}
                      </div>
                    </div>
                  )}

                  {/* Tooltip */}
                  {(isHovered || isFocused) && (
                    <div 
                      id={`step-${step.id}-tooltip`}
                      className="absolute bottom-full mb-4 z-10 animate-fade-in"
                      role="tooltip"
                    >
                      <div className="bg-popover text-popover-foreground text-sm rounded-lg py-2 px-3 shadow-md border whitespace-nowrap max-w-48 text-center">
                        {step.description}
                      </div>
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover mx-auto mt-1" />
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {idx < activeSteps.length - 1 && (
                  <div className={cn("flex-1 relative", compact ? "mx-2" : "mx-4")}>
                    <div className="h-0.5 bg-muted rounded-full"></div>
                    <div 
                      className={cn(
                        "absolute top-0 left-0 h-0.5 rounded-full transition-all duration-500",
                        getConnectorStyles(step.id)
                      )}
                      style={{ 
                        width: step.id < activeCurrentStep ? '100%' : '0%' 
                      }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress indicator */}
        {!compact && (
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {progressPercentage}%
              </span>
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Tokenization progress: ${progressPercentage}%`}
              ></div>
            </div>
            
            {data?.estimatedCompletion && (
              <div className="mt-2 text-xs text-muted-foreground">
                Estimated completion: {new Date(data.estimatedCompletion).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}