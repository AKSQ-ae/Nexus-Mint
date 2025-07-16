import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ProgressiveSectionProps {
  title: string;
  preview: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  variant?: 'default' | 'minimal' | 'card';
  className?: string;
}

export function ProgressiveSection({
  title,
  preview,
  children,
  defaultExpanded = false,
  variant = 'default',
  className
}: ProgressiveSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const variants = {
    default: "border border-border rounded-lg p-6 bg-card",
    minimal: "border-b border-border pb-4",
    card: "bg-gradient-to-br from-card to-muted/30 rounded-xl p-6 shadow-elegant border border-border/50"
  };

  return (
    <div className={cn(variants[variant], className)}>
      <div 
        className="cursor-pointer" 
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            {!isExpanded && (
              <p className="text-muted-foreground text-sm pr-4">{preview}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div 
          id={`content-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="mt-4 animate-fade-in"
        >
          {children}
        </div>
      )}
    </div>
  );
}