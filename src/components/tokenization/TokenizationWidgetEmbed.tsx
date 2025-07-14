import React from 'react';
import { TokenizationFlowWidget } from './TokenizationFlowWidget';

interface TokenizationWidgetEmbedProps {
  propertyId?: string;
  compact?: boolean;
  autoRefresh?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  onStepClick?: (step: any) => void;
}

// Web Component wrapper for iframe embedding
export function TokenizationWidgetEmbed({ 
  propertyId, 
  compact = false,
  autoRefresh = true,
  theme = 'auto',
  onStepClick 
}: TokenizationWidgetEmbedProps) {
  // Apply theme class to root
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    // 'auto' uses system preference (default behavior)
  }, [theme]);

  const handleStepClick = (step: any) => {
    // Send message to parent frame if embedded
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'tokenization-step-click',
        data: { step, propertyId }
      }, '*');
    }
    
    onStepClick?.(step);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <TokenizationFlowWidget
        propertyId={propertyId}
        compact={compact}
        autoRefresh={autoRefresh}
        onStepClick={handleStepClick}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}

// Standalone page component for iframe src
export function TokenizationWidgetPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('propertyId') || undefined;
  const compact = urlParams.get('compact') === 'true';
  const autoRefresh = urlParams.get('autoRefresh') !== 'false';
  const theme = urlParams.get('theme') as 'light' | 'dark' | 'auto' || 'auto';

  return (
    <TokenizationWidgetEmbed
      propertyId={propertyId}
      compact={compact}
      autoRefresh={autoRefresh}
      theme={theme}
    />
  );
}