import { cn } from "@/lib/utils";

type StatusType = "normal" | "warning" | "critical";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusIndicator({
  status,
  label,
  size = "md",
}: StatusIndicatorProps) {
  const statusColors = {
    normal: "bg-chart-2",
    warning: "bg-chart-4",
    critical: "bg-destructive",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "rounded-full",
          statusColors[status],
          sizeClasses[size]
        )}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}