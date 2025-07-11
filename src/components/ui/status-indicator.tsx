import { StatusDot, StatusType } from "./status-dot";
import { InfoTooltip } from "./info-tooltip";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  tooltip?: string;
  className?: string;
}

export function StatusIndicator({ status, label, tooltip, className }: StatusIndicatorProps) {
  const content = (
    <div className={cn("flex items-center", className)}>
      <StatusDot status={status} />
      <span className={cn("text-sm", {
        "text-green-600 dark:text-green-400": status === "healthy",
        "text-yellow-600 dark:text-yellow-400": status === "warning",
        "text-red-600 dark:text-red-400": status === "error",
      })}>
        {label}
      </span>
    </div>
  );

  if (tooltip) {
    return (
      <InfoTooltip content={tooltip}>
        {content}
      </InfoTooltip>
    );
  }

  return content;
}