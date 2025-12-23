import { useMemo, useEffect, useState } from "react";
import type { RGBStyle } from "@shared/schema";

interface RGBPreviewProps {
  color: string;
  brightness: number;
  style: RGBStyle;
  speed: number;
  ledCount: number;
  enabled: boolean;
}

export function RGBPreview({
  color,
  brightness,
  style,
  speed,
  ledCount,
  enabled,
}: RGBPreviewProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!enabled || style === "solid") return;

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 360);
    }, Math.max(20, 100 - speed));

    return () => clearInterval(interval);
  }, [enabled, style, speed]);

  const getLedColor = useMemo(() => {
    if (!enabled) return () => "rgba(50, 50, 50, 0.3)";

    const baseOpacity = brightness / 100;

    switch (style) {
      case "solid":
        return () => color;
      case "breathing":
        return () => {
          const breathFactor = (Math.sin((animationPhase * Math.PI) / 180) + 1) / 2;
          return adjustBrightness(color, breathFactor * baseOpacity);
        };
      case "flow":
        return (index: number) => {
          const offset = (index / ledCount) * 360;
          const flowFactor =
            (Math.sin(((animationPhase + offset) * Math.PI) / 180) + 1) / 2;
          return adjustBrightness(color, flowFactor * baseOpacity);
        };
      case "rainbow":
        return (index: number) => {
          const hue = (animationPhase + (index / ledCount) * 360) % 360;
          return `hsla(${hue}, 100%, 50%, ${baseOpacity})`;
        };
      case "hue_cycle":
        return () => {
          return `hsla(${animationPhase}, 100%, 50%, ${baseOpacity})`;
        };
      default:
        return () => color;
    }
  }, [enabled, style, color, brightness, animationPhase, ledCount]);

  return (
    <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-muted/50">
      {Array.from({ length: Math.min(ledCount, 8) }).map((_, index) => (
        <div
          key={index}
          className="w-4 h-4 rounded-full transition-all duration-75"
          style={{
            backgroundColor: getLedColor(index),
            boxShadow: enabled
              ? `0 0 10px ${getLedColor(index)}, 0 0 20px ${getLedColor(index)}`
              : "none",
          }}
        />
      ))}
      {ledCount > 8 && (
        <span className="text-xs text-muted-foreground ml-2">
          +{ledCount - 8} more
        </span>
      )}
    </div>
  );
}

function adjustBrightness(hexColor: string, factor: number): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${factor})`;
}
