import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <div className={cn("flex items-center justify-center rounded-lg p-1", className)}>
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simple infinity symbol */}
        <path 
          d="M10 20C10 15 12 12 16 12C20 12 22 15 24 18C26 15 28 12 32 12C36 12 38 15 38 20C38 25 36 28 32 28C28 28 26 25 24 22C22 25 20 28 16 28C12 28 10 25 10 20Z" 
          fill="url(#simpleGradient)"
          stroke="#1E40AF"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="simpleGradient" x1="10" y1="20" x2="38" y2="20">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}