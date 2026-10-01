import NumberFlow from "@number-flow/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SentimentTone } from "@/lib/tempo-data";

export function ProgressMetricCard({
  label,
  value,
  suffix = "%",
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon?: LucideIcon;
  tone?: SentimentTone;
  hint?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "panel p-4",
        tone === "bullish" && "border-bullish/30",
        tone === "neutral" && "border-ice/25",
        tone === "panic" && "border-panic/30",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {Icon ? <Icon className="size-3.5" /> : null}
          {label}
        </span>
        <span
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            tone === "bullish" ? "text-bullish" : tone === "panic" ? "text-panic" : "text-ice",
          )}
        >
          <NumberFlow value={value} format={{ maximumFractionDigits: 1 }} suffix={suffix} />
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            tone === "bullish" ? "bg-bullish" : tone === "panic" ? "bg-panic" : "bg-ice",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
