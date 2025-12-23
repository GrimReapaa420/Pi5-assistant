import { useMemo } from "react";

interface MiniChartProps {
  data: number[];
  height?: number;
  color?: string;
  fillOpacity?: number;
}

export function MiniChart({
  data,
  height = 40,
  color = "hsl(var(--chart-1))",
  fillOpacity = 0.2,
}: MiniChartProps) {
  const { path, area, viewBox } = useMemo(() => {
    if (data.length < 2) {
      return { path: "", area: "", viewBox: "0 0 100 40" };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const padding = 2;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    const areaD =
      pathD +
      ` L ${width} ${height} L 0 ${height} Z`;

    return {
      path: pathD,
      area: areaD,
      viewBox: `0 0 ${width} ${height}`,
    };
  }, [data, height]);

  if (data.length < 2) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-muted-foreground"
        style={{ height }}
      >
        No data
      </div>
    );
  }

  return (
    <svg viewBox={viewBox} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGradient)" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
