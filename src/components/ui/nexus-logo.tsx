import { cn } from "@/lib/utils";

interface NexusLogoProps {
  className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className="text-2xl font-bold text-white">N</div>
        <div className="absolute inset-0 text-2xl font-bold bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent">
          N
        </div>
      </div>
    </div>
  );
}