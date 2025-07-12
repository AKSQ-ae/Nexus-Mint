import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <svg 
      className={cn("", className)} 
      viewBox="0 0 100 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      
      {/* Infinity loop design */}
      <path 
        d="M25 15 C 5 15, 5 45, 25 45 C 35 45, 40 30, 50 30 C 60 30, 65 45, 75 45 C 95 45, 95 15, 75 15 C 65 15, 60 30, 50 30 C 40 30, 35 15, 25 15 Z" 
        fill="url(#blueGradient)"
        opacity="0.9"
      />
      <path 
        d="M25 18 C 8 18, 8 42, 25 42 C 33 42, 37 32, 50 32 C 63 32, 67 42, 75 42 C 92 42, 92 18, 75 18 C 67 18, 63 28, 50 28 C 37 28, 33 18, 25 18 Z" 
        fill="url(#orangeGradient)"
        opacity="0.8"
      />
    </svg>
  );
}