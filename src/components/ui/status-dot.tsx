import { cn } from "@/lib/utils";

export type StatusType = "healthy" | "warning" | "error";

interface StatusDotProps {
  status: StatusType;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block w-3 h-3 rounded-full mr-2 relative animate-pulse",
        "before:content-[''] before:absolute before:-top-1 before:-left-1 before:-right-1 before:-bottom-1",
        "before:rounded-full before:opacity-30 before:animate-[ripple_2s_infinite]",
        {
          "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] before:bg-green-500": status === "healthy",
          "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] before:bg-yellow-500": status === "warning", 
          "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] before:bg-red-500": status === "error",
        },
        className
      )}
    />
  );
}