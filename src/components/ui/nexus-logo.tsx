import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <svg 
      className={cn("", className)} 
      viewBox="0 0 102 68" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nexusGradient" x1="0" y1="34" x2="102" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB"/>
          <stop offset="1" stopColor="#F97316"/>
        </linearGradient>
      </defs>
      <path 
        d="M76.23 67.33C91.93 67.33 101.5 54.15 101.5 34.11C101.5 13.97 91.93 0.889999 76.23 0.889999L50.89 0.889999C39.4 0.889999 29.98 7.37 25.77 17.51L25.77 17.51C29.98 7.37 39.4 0.889999 50.89 0.889999L76.23 0.889999C91.93 0.889999 101.5 13.97 101.5 34.11C101.5 54.15 91.93 67.33 76.23 67.33L50.89 67.33C39.4 67.33 29.98 60.85 25.77 50.71M25.77 50.71L25.77 50.71C29.98 60.85 39.4 67.33 50.89 67.33L25.77 50.71ZM25.77 50.71C10.07 50.71 0.5 37.53 0.5 17.51C0.5 -2.63 10.07 -15.71 25.77 -15.71L50.89 -15.71C62.38 -15.71 71.8 -9.23 76.01 -0.89L76.01 -0.89C71.8 -9.23 62.38 -15.71 50.89 -15.71L25.77 -15.71C10.07 -15.71 0.5 -2.63 0.5 17.51C0.5 37.53 10.07 50.71 25.77 50.71Z" 
        fill="url(#nexusGradient)"
      />
    </svg>
  );
}