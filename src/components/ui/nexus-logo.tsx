import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <svg 
      className={cn("", className)} 
      viewBox="0 0 120 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blueLoop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="30%" stopColor="#3B82F6" />
          <stop offset="70%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
        <linearGradient id="orangeLoop" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="30%" stopColor="#F97316" />
          <stop offset="70%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#FED7AA" />
        </linearGradient>
        <linearGradient id="blueHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DBEAFE" opacity="0.8" />
          <stop offset="100%" stopColor="#3B82F6" opacity="0.4" />
        </linearGradient>
        <linearGradient id="orangeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FED7AA" opacity="0.8" />
          <stop offset="100%" stopColor="#F97316" opacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Blue loop - back part */}
      <path 
        d="M20 25 C 5 25, 5 55, 20 55 C 35 55, 45 40, 60 40 C 75 40, 85 55, 100 55 C 115 55, 115 25, 100 25 C 90 25, 85 35, 75 35 C 65 35, 60 25, 50 25 C 45 25, 40 30, 35 35 C 30 40, 25 45, 20 45 C 10 45, 10 35, 20 35 C 25 35, 30 32, 35 30"
        fill="url(#blueLoop)"
        stroke="url(#blueHighlight)"
        strokeWidth="1"
      />
      
      {/* Orange loop - front part */}
      <path 
        d="M100 25 C 115 25, 115 55, 100 55 C 85 55, 75 40, 60 40 C 45 40, 35 55, 20 55 C 5 55, 5 25, 20 25 C 30 25, 35 35, 45 35 C 55 35, 60 25, 70 25 C 75 25, 80 30, 85 35 C 90 40, 95 45, 100 45 C 110 45, 110 35, 100 35 C 95 35, 90 32, 85 30"
        fill="url(#orangeLoop)"
        stroke="url(#orangeHighlight)"
        strokeWidth="1"
        opacity="0.95"
      />
    </svg>
  );
}