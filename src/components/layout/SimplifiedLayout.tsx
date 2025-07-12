import { useState } from 'react';
import { useGuidedTour } from '@/components/ui/guided-tour';
import { Button } from '@/components/ui/button';
import { HelpCircle, Lightbulb } from 'lucide-react';

interface SimplifiedLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHelpButton?: boolean;
  tourSteps?: any[];
}

export function SimplifiedLayout({ 
  children, 
  title, 
  description, 
  showHelpButton = true,
  tourSteps = []
}: SimplifiedLayoutProps) {
  const { startTour, TourComponent } = useGuidedTour('page-tour', tourSteps);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Page Header with Better Visual Hierarchy */}
      {(title || description) && (
        <div className="bg-card/50 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {title && (
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Help & Tour Actions */}
              {(showHelpButton || tourSteps.length > 0) && (
                <div className="flex items-center gap-2">
                  {tourSteps.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startTour}
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Quick Tour
                    </Button>
                  )}
                  {showHelpButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Enhanced Spacing */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {children}
        </div>
      </div>

      {/* Tour Component */}
      <TourComponent />
    </div>
  );
}