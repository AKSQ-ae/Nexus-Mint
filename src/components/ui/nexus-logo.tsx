import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <svg 
      className={cn("w-8 h-8", className)} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="50%" stopColor="#6366F1"/>
          <stop offset="100%" stopColor="#F97316"/>
        </linearGradient>
      </defs>
      <path 
        d="M25 35C15 35 10 45 10 50C10 55 15 65 25 65C35 65 45 55 50 50C55 45 65 35 75 35C85 35 90 45 90 50C90 55 85 65 75 65C65 65 55 55 50 50C45 55 35 65 25 65C15 65 10 55 10 50C10 45 15 35 25 35Z" 
        fill="url(#infinityGradient)"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}