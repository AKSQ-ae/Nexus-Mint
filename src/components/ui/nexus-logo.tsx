import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <div 
      className={cn("w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 shadow-lg", className)}
      style={{
        background: 'linear-gradient(45deg, #2563EB, #8B5CF6, #F97316)',
        border: '2px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
    </div>
  );
}