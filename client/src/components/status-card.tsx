import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface StatusCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
  unit?: string;
  subtitle?: string;
  progress?: number;
  trend?: "up" | "down" | "stable";
  status?: "normal" | "warning" | "critical";
  unavailable?: boolean;
  testId?: string;
}

export function StatusCard({
  title,
  icon,
  value,
  unit,
  subtitle,
  progress,
  status = "normal",
  unavailable = false,
  testId,
}: StatusCardProps) {
  const statusColors = {
    normal: "text-chart-1",
    warning: "text-yellow-500",
    critical: "text-destructive",
  };

  const progressColors = {
    normal: "",
    warning: "[&>div]:bg-yellow-500",
    critical: "[&>div]:bg-destructive",
  };

  return (
    <Card className="relative overflow-visible" data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Not Available</span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-3xl font-mono font-semibold ${statusColors[status]}`}
                data-testid={testId ? `${testId}-value` : undefined}
              >
                {value}
              </span>
              {unit && (
                <span className="text-sm text-muted-foreground font-mono">
                  {unit}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {progress !== undefined && (
              <Progress
                value={progress}
                className={`h-2 mt-3 ${progressColors[status]}`}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusIndicatorProps {
  label: string;
  status: "on" | "off" | "auto";
  color?: string;
}

export function StatusIndicator({ label, status, color }: StatusIndicatorProps) {
  const statusStyles = {
    on: "bg-green-500",
    off: "bg-muted",
    auto: "bg-blue-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${color || statusStyles[status]}`}
        style={color ? { backgroundColor: color } : undefined}
      />
      <span className="text-sm">{label}</span>
      <span className="text-xs text-muted-foreground capitalize">({status})</span>
    </div>
  );
}
