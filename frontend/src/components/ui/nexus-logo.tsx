import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <div 
      className={cn("w-8 h-8 rounded-full shadow-lg", className)}
      style={{
        background: 'var(--gradient-hero)',
        border: '2px solid hsl(var(--background))',
        boxShadow: 'var(--shadow-elegant)'
      }}
    >
    </div>
  );
}