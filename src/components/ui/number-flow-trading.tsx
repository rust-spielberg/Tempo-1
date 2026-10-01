import NumberFlow from "@number-flow/react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { changeSentiment } from "@/lib/tempo-data";
import { cn } from "@/lib/utils";

export function PriceFlow({
  value,
  currency = "USD",
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  return (
    <NumberFlow
      value={value}
      format={{
        style: "currency",
        currency,
        maximumFractionDigits: value < 10 ? 4 : 2,
      }}
      className={cn("font-mono text-4xl font-semibold tabular-nums", className)}
    />
  );
}

export function ChangeFlow({ value, className }: { value: number; className?: string }) {
  const tone = changeSentiment(value);
  const Icon = tone === "bullish" ? ArrowUpRight : tone === "panic" ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm font-semibold tabular-nums",
        tone === "bullish"
          ? "bg-bullish/10 text-bullish"
          : tone === "panic"
            ? "bg-panic/12 text-panic"
            : "bg-ice/10 text-ice",
        className,
      )}
    >
      <Icon className="size-4" />
      <NumberFlow
        value={value / 100}
        format={{ style: "percent", maximumFractionDigits: 2, signDisplay: "always" }}
      />
    </span>
  );
}

export function VolumeFlow({ value }: { value: number }) {
  return (
    <NumberFlow
      value={value}
      format={{ notation: "compact", maximumFractionDigits: 2 }}
      prefix="$"
      className="font-mono text-2xl font-semibold tabular-nums"
    />
  );
}
