import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  content: string | ReactNode;
  children?: ReactNode;
  className?: string;
}

export function InfoTooltip({ content, children, className = "" }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Info className={`h-4 w-4 text-muted-foreground hover:text-primary cursor-help transition-colors ${className}`} />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}