import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  FileText,
  RefreshCw,
  Download,
  Filter,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR";
  message: string;
  source: string;
}

const levelColors: Record<string, string> = {
  DEBUG: "bg-muted text-muted-foreground",
  INFO: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  WARNING: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  ERROR: "bg-destructive/20 text-destructive",
};

export default function Logs() {
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const { data: logs, isLoading, refetch, isFetching } = useQuery<LogEntry[]>({
    queryKey: ["/api/logs"],
    refetchInterval: 10000,
  });

  const filteredLogs = logs?.filter(
    (log) => levelFilter === "all" || log.level === levelFilter
  );

  const handleDownload = () => {
    if (!logs) return;
    const content = logs
      .map((log) => `[${log.timestamp}] [${log.level}] ${log.source}: ${log.message}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pironman5-logs-${new Date().toISOString().split("T")[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-logs-title">
            System Logs
          </h1>
          <p className="text-sm text-muted-foreground">
            View addon and hardware status logs
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32" data-testid="select-log-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="DEBUG">Debug</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-logs"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!logs?.length}
            data-testid="button-download-logs"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Log Entries
            </CardTitle>
            {logs && (
              <span className="text-xs text-muted-foreground">
                Showing {filteredLogs?.length || 0} of {logs.length} entries
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LogsSkeleton />
          ) : !filteredLogs?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No log entries found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {levelFilter !== "all"
                  ? "Try adjusting the filter"
                  : "Logs will appear as the system runs"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 font-mono text-sm">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 group"
                    data-testid={`log-entry-${log.id}`}
                  >
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-0 ${levelColors[log.level]}`}
                    >
                      {log.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      [{log.source}]
                    </span>
                    <span className="flex-1 break-all">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
