import { useQuery } from "@tanstack/react-query";
import {
  Thermometer,
  Cpu,
  MemoryStick,
  HardDrive,
  Fan,
  Wifi,
  Activity,
  Clock,
  Palette,
  Monitor,
  AlertCircle,
} from "lucide-react";
import { StatusCard, StatusIndicator } from "@/components/status-card";
import { MiniChart } from "@/components/mini-chart";
import { RGBPreview } from "@/components/rgb-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SystemStatus, AddonConfig } from "@shared/schema";
import { useState, useEffect } from "react";

const NA = "N/A";

function formatBytes(bytes: number | null): string {
  if (bytes === null) return NA;
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getTemperatureStatus(temp: number | null): "normal" | "warning" | "critical" {
  if (temp === null) return "normal";
  if (temp >= 80) return "critical";
  if (temp >= 70) return "warning";
  return "normal";
}

export default function Dashboard() {
  const [tempHistory, setTempHistory] = useState<number[]>([]);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);

  const { data: config } = useQuery<AddonConfig>({
    queryKey: ["/api/config"],
  });

  const pollingIntervalMs = (config?.pollingInterval || 5) * 1000;

  const { data: status, isLoading: statusLoading } = useQuery<SystemStatus>({
    queryKey: ["/api/status"],
    refetchInterval: config?.webUiEnabled !== false ? pollingIntervalMs : false,
    enabled: config?.webUiEnabled !== false,
  });

  useEffect(() => {
    if (status?.cpuTemperature !== null && status?.cpuTemperature !== undefined) {
      setTempHistory((prev) => [...prev.slice(-29), status.cpuTemperature!]);
    }
    if (status?.cpuPercent !== null && status?.cpuPercent !== undefined) {
      setCpuHistory((prev) => [...prev.slice(-29), status.cpuPercent!]);
    }
  }, [status]);

  if (config?.webUiEnabled === false) {
    return <WebUIDisabled />;
  }

  if (statusLoading) {
    return <DashboardSkeleton />;
  }

  const tempUnit = config?.temperatureUnit || "C";
  const displayTemp = (temp: number | null): string => {
    if (temp === null) return NA;
    if (tempUnit === "F") return String(Math.round(temp * 1.8 + 32));
    return String(Math.round(temp));
  };

  const displayPercent = (value: number | null): string => {
    if (value === null) return NA;
    return String(Math.round(value));
  };

  const displayNumber = (value: number | null): string => {
    if (value === null) return NA;
    return String(Math.round(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            System Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time hardware monitoring for Pironman 5
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3" />
            Polling: {config?.pollingInterval || 5}s
          </Badge>
          <Badge
            variant={status ? "default" : "secondary"}
            className="gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${status ? "bg-green-400" : "bg-muted-foreground"}`} />
            {status ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="CPU Temperature"
          icon={<Thermometer className="w-5 h-5" />}
          value={displayTemp(status?.cpuTemperature ?? null)}
          unit={status?.cpuTemperature !== null ? `°${tempUnit}` : ""}
          status={getTemperatureStatus(status?.cpuTemperature ?? null)}
          unavailable={status?.cpuTemperature === null}
          testId="card-cpu-temp"
        />

        <StatusCard
          title="GPU Temperature"
          icon={<Thermometer className="w-5 h-5" />}
          value={displayTemp(status?.gpuTemperature ?? null)}
          unit={status?.gpuTemperature !== null ? `°${tempUnit}` : ""}
          status={getTemperatureStatus(status?.gpuTemperature ?? null)}
          unavailable={status?.gpuTemperature === null}
          testId="card-gpu-temp"
        />

        <StatusCard
          title="CPU Usage"
          icon={<Cpu className="w-5 h-5" />}
          value={displayPercent(status?.cpuPercent ?? null)}
          unit={status?.cpuPercent !== null ? "%" : ""}
          progress={status?.cpuPercent ?? undefined}
          status={
            status?.cpuPercent === null
              ? "normal"
              : (status?.cpuPercent ?? 0) >= 90
                ? "critical"
                : (status?.cpuPercent ?? 0) >= 75
                  ? "warning"
                  : "normal"
          }
          unavailable={status?.cpuPercent === null}
          testId="card-cpu-usage"
        />

        <StatusCard
          title="Memory Usage"
          icon={<MemoryStick className="w-5 h-5" />}
          value={displayPercent(status?.memoryPercent ?? null)}
          unit={status?.memoryPercent !== null ? "%" : ""}
          subtitle={
            status && status.memoryUsed !== null && status.memoryTotal !== null
              ? `${formatBytes(status.memoryUsed)} / ${formatBytes(status.memoryTotal)}`
              : undefined
          }
          progress={status?.memoryPercent ?? undefined}
          status={
            status?.memoryPercent === null
              ? "normal"
              : (status?.memoryPercent ?? 0) >= 90
                ? "critical"
                : (status?.memoryPercent ?? 0) >= 75
                  ? "warning"
                  : "normal"
          }
          unavailable={status?.memoryPercent === null}
          testId="card-memory"
        />

        <StatusCard
          title="Storage"
          icon={<HardDrive className="w-5 h-5" />}
          value={displayPercent(status?.diskPercent ?? null)}
          unit={status?.diskPercent !== null ? "%" : ""}
          subtitle={
            status && status.diskUsed !== null && status.diskTotal !== null
              ? `${formatBytes(status.diskUsed)} / ${formatBytes(status.diskTotal)}`
              : undefined
          }
          progress={status?.diskPercent ?? undefined}
          status={
            status?.diskPercent === null
              ? "normal"
              : (status?.diskPercent ?? 0) >= 90
                ? "critical"
                : (status?.diskPercent ?? 0) >= 75
                  ? "warning"
                  : "normal"
          }
          unavailable={status?.diskPercent === null}
          testId="card-storage"
        />

        <StatusCard
          title="Fan Speed"
          icon={<Fan className="w-5 h-5" />}
          value={status?.fanSpeed !== null && status?.fanSpeed !== undefined ? displayNumber(status.fanSpeed) : NA}
          unit={status?.fanSpeed !== null ? "%" : ""}
          subtitle={status?.fanState !== "unavailable" ? `Mode: ${config?.fanMode || "balanced"}` : undefined}
          progress={status?.fanSpeed ?? undefined}
          unavailable={status?.fanState === "unavailable"}
          testId="card-fan"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Temperature Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tempHistory.length > 0 ? (
              <>
                <MiniChart
                  data={tempHistory}
                  height={80}
                  color={
                    getTemperatureStatus(status?.cpuTemperature ?? null) === "critical"
                      ? "hsl(var(--destructive))"
                      : getTemperatureStatus(status?.cpuTemperature ?? null) === "warning"
                        ? "hsl(40, 100%, 50%)"
                        : "hsl(var(--chart-1))"
                  }
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>30 readings ago</span>
                  <span>Now</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                <AlertCircle className="w-5 h-5 mb-1" />
                <span className="text-sm">No data available</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              CPU Usage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cpuHistory.length > 0 ? (
              <>
                <MiniChart
                  data={cpuHistory}
                  height={80}
                  color="hsl(var(--chart-2))"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>30 readings ago</span>
                  <span>Now</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                <AlertCircle className="w-5 h-5 mb-1" />
                <span className="text-sm">No data available</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Network Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Upload</span>
              <span className="font-mono text-sm" data-testid="text-network-upload">
                {status?.networkUpload !== null ? `${formatBytes(status?.networkUpload ?? 0)}/s` : NA}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Download</span>
              <span className="font-mono text-sm" data-testid="text-network-download">
                {status?.networkDownload !== null ? `${formatBytes(status?.networkDownload ?? 0)}/s` : NA}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="font-mono text-sm" data-testid="text-uptime">
                {formatUptime(status?.uptime ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">CPU Freq</span>
              <span className="font-mono text-sm">
                {status?.cpuFrequency !== null ? `${Math.round(status?.cpuFrequency ?? 0)} MHz` : NA}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              RGB Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config && (
              <>
                <RGBPreview
                  color={config.rgbColor}
                  brightness={config.rgbBrightness}
                  style={config.rgbStyle}
                  speed={config.rgbSpeed}
                  ledCount={config.rgbLedCount}
                  enabled={config.rgbEnabled}
                />
                <div className="mt-3 space-y-1">
                  <StatusIndicator
                    label="RGB LEDs"
                    status={config.rgbEnabled ? "on" : "off"}
                    color={config.rgbEnabled ? config.rgbColor : undefined}
                  />
                  <p className="text-xs text-muted-foreground capitalize">
                    Style: {config.rgbStyle.replace("_", " ")}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {config?.oledEnabled && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              OLED Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <StatusIndicator label="Display" status={config.oledEnabled ? "on" : "off"} />
              <span className="text-sm text-muted-foreground">
                Rotation: {config.oledRotation}°
              </span>
              {config.oledSleepEnabled && (
                <span className="text-sm text-muted-foreground">
                  Sleep after: {config.oledSleepTimeout}s
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WebUIDisabled() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Monitor className="w-16 h-16 text-muted-foreground mb-6" />
      <h2 className="text-2xl font-semibold mb-2">Web UI Disabled</h2>
      <p className="text-muted-foreground max-w-md">
        The web dashboard is currently disabled in the addon configuration. 
        The addon is still running in the background monitoring your hardware.
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        To enable the dashboard, go to Configuration and toggle "Enable Web UI" on.
      </p>
    </div>
  );
}
