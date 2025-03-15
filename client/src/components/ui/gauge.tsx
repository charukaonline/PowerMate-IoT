import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  label?: string;
  color?: "default" | "success" | "warning" | "danger";
  max?: number;
  unit?: string;
}

export function Gauge({
  value,
  size = "md",
  showValue = true,
  label,
  color = "default",
  max = 100,
  unit = "%",
}: GaugeProps) {
  const percentage = (value / max) * 100;
  const angle = (percentage * 180) / 100;

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const colorClasses = {
    default: "text-primary",
    success: "text-chart-2",
    warning: "text-chart-4",
    danger: "text-destructive",
  };

  const getColor = () => {
    if (color !== "default") return colorClasses[color];
    if (percentage >= 66) return colorClasses.success;
    if (percentage >= 33) return colorClasses.warning;
    return colorClasses.danger;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {label && <div className="text-sm font-medium mb-2">{label}</div>}
      <div className={cn("relative", sizeClasses[size])}>
        <svg
          className="w-full h-full"
          viewBox="0 0 100 50"
          style={{ transform: "rotate(-90deg)" }}
        >
          <path
            d="M 0,50 A 50,50 0 1,1 100,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeOpacity="0.1"
          />
          <path
            d="M 0,50 A 50,50 0 1,1 100,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray="157"
            strokeDashoffset={157 - (157 * angle) / 180}
            className={cn(getColor())}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">
              {value}
              {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}