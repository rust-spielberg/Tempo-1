import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  Brain,
  Flame,
  Gauge,
  Radar,
  Radio,
  Search,
  Waves,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { ConstellationGrid } from "@/components/ui/constellation-grid";
import { ChangeFlow, PriceFlow, VolumeFlow } from "@/components/ui/number-flow-trading";
import { ProgressMetricCard } from "@/components/ui/progress-metric-card";
import { ASSETS, vibeLabel, type Asset, type EvidenceTag } from "@/lib/tempo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TEMPO — Live Market Sentiment Radar" },
      {
        name: "description",
        content:
          "TEMPO translates market chaos and live sentiment telemetry into human emotional metrics, with a psychological Vibe Score for every asset.",
      },
      { property: "og:title", content: "TEMPO — Live Market Sentiment Radar" },
      {
        property: "og:description",
        content:
          "A cyberpunk sentiment terminal: Vibe Scores, live price telemetry and human explanations for why the market feels the way it does.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TempoPage,
});

const TAG_STYLES: Record<EvidenceTag, string> = {
  Bullish: "border-ice/35 bg-ice/10 text-ice",
  Bearish: "border-panic/40 bg-panic/10 text-panic",
  FUD: "border-border bg-secondary text-muted-foreground",
};

function useLiveAsset(base: Asset) {
  const [live, setLive] = useState(base);
  const baseRef = useRef(base);

  useEffect(() => {
    baseRef.current = base;
    setLive(base);
  }, [base]);

  useEffect(() => {
    const id = setInterval(() => {
      setLive((prev) => {
        const anchor = baseRef.current;
        const drift = (Math.random() - 0.5) * (anchor.volatility / 100) * 0.006;
        const price = Math.max(0.01, prev.price * (1 + drift));
        return {
          ...prev,
          price,
          change: Number((((price - anchor.price) / anchor.price) * 100 + anchor.change).toFixed(2)),
          volume: Math.max(1, anchor.volume * (0.94 + Math.random() * 0.12)),
          vibe: Math.max(
            2,
            Math.min(98, Number((prev.vibe + (Math.random() - 0.5) * 2.4).toFixed(1))),
          ),
          socialVelocity: Math.max(
            5,
            Math.min(99, anchor.socialVelocity + (Math.random() - 0.5) * 8),
          ),
          liquidations: Math.max(1, Math.min(99, anchor.liquidations + (Math.random() - 0.5) * 6)),
        };
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return live;
}

function TempoPage() {
  const [selectedId, setSelectedId] = useState(ASSETS[0]!.id);
  const [query, setQuery] = useState("");

  const selectedBase = useMemo(
    () => ASSETS.find((a) => a.id === selectedId) ?? ASSETS[0]!,
    [selectedId],
  );
  const asset = useLiveAsset(selectedBase);
  const vibe = vibeLabel(asset.vibe);
  const isPanic = vibe.tone === "panic";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ASSETS;
    return ASSETS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.symbol.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [query]);

  const scrollToTerminal = () => {
    document.getElementById("terminal")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="relative min-h-screen">
      {/* ---------------- HERO ---------------- */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <ConstellationGrid />
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,transparent_0%,var(--background)_100%)]" />

        <div className="animate-in fade-in slide-in-from-bottom-4 relative z-10 flex flex-col items-center px-6 text-center duration-700">
          <span className="panel inline-flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="relative flex size-2">
              <span className="animate-tempo-pulse absolute inline-flex size-2 rounded-full bg-ice" />
              <span className="relative inline-flex size-2 rounded-full bg-ice" />
            </span>
            Live telemetry
          </span>

          <h1 className="mt-7 font-display text-6xl font-bold tracking-widest-xl text-foreground sm:text-7xl md:text-8xl">
            <span className="text-gradient-ice">TEMPO</span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            Translating market chaos and live sentiment telemetry into human emotional metrics.
          </p>

          <button
            type="button"
            onClick={scrollToTerminal}
            className="glow-ice mt-9 inline-flex items-center gap-2 rounded-lg border border-ice/40 bg-ice/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ice transition-all duration-300 hover:bg-ice/20 hover:shadow-[0_0_46px_-8px_color-mix(in_oklab,var(--ice)_60%,transparent)]"
          >
            <Zap className="size-4" />
            Enter Playground
          </button>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>6 assets streaming</span>
            <span className="hidden sm:inline">·</span>
            <span>sentiment refresh 1.8s</span>
            <span className="hidden sm:inline">·</span>
            <span>vibe engine v2</span>
          </div>
        </div>
      </section>

      {/* ---------------- PLAYGROUND ---------------- */}
      <section id="terminal" className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-ice">
              <Radar className="size-3.5" />
              Sentiment playground
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The emotional state of the tape
            </h2>
          </div>

          <label className="panel flex w-full items-center gap-2 px-3 py-2 md:w-72">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Bitcoin, NVDA, index…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </header>

        {/* Asset selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {results.map((a) => {
            const active = a.id === selectedId;
            const tone = vibeLabel(a.vibe).tone;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={cn(
                  "group flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-all duration-300",
                  active
                    ? tone === "ice"
                      ? "border-ice/45 bg-ice/10 text-ice"
                      : "border-panic/45 bg-panic/10 text-panic"
                    : "border-border bg-surface text-muted-foreground hover:border-ice/30 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    tone === "ice" ? "bg-ice" : "bg-panic",
                  )}
                />
                <span className="font-mono font-semibold">{a.symbol}</span>
                <span className="hidden text-xs opacity-70 sm:inline">{a.name}</span>
              </button>
            );
          })}
          {results.length === 0 && (
            <p className="text-sm text-muted-foreground">No asset matches that search.</p>
          )}
        </div>

        <BentoGrid>
          {/* Card 1 — Vibe Score hero */}
          <BentoCard tone={vibe.tone} className="md:col-span-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Vibe score · {asset.name}
                </span>
                <div className="mt-3 flex items-end gap-3">
                  <span
                    className={cn(
                      "font-mono text-6xl font-bold leading-none tabular-nums sm:text-7xl",
                      isPanic ? "text-panic" : "text-ice",
                    )}
                  >
                    {Math.round(asset.vibe)}
                  </span>
                  <span className="pb-2 font-mono text-sm text-muted-foreground">/ 100</span>
                </div>
                <span
                  className={cn(
                    "mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
                    isPanic
                      ? "border-panic/40 bg-panic/10 text-panic"
                      : "border-ice/40 bg-ice/10 text-ice",
                  )}
                >
                  {isPanic ? <Flame className="size-3.5" /> : <Waves className="size-3.5" />}
                  {vibe.label}
                </span>
              </div>

              {/* Aura */}
              <div className="relative hidden size-32 shrink-0 items-center justify-center sm:flex">
                <div
                  className={cn(
                    "animate-tempo-pulse absolute size-28 rounded-full blur-2xl",
                    isPanic ? "bg-panic/40" : "bg-ice/35",
                  )}
                />
                <div
                  className={cn(
                    "relative flex size-20 items-center justify-center rounded-full border",
                    isPanic ? "border-panic/50" : "border-ice/50",
                  )}
                >
                  <Gauge className={cn("size-8", isPanic ? "text-panic" : "text-ice")} />
                </div>
              </div>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-out",
                  isPanic ? "bg-panic" : "bg-ice",
                )}
                style={{ width: `${asset.vibe}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>Severe panic</span>
              <span>Silent euphoria</span>
            </div>
          </BentoCard>

          {/* Card 2 — Live number flow ticker */}
          <BentoCard className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Live ticker
            </span>
            <div className="mt-4 flex flex-col gap-3">
              <PriceFlow
                value={asset.price}
                className={isPanic ? "text-panic" : "text-ice"}
              />
              <ChangeFlow value={asset.change} className="self-start" />
              <div className="mt-2 border-t border-border pt-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  24h volume
                </span>
                <div className="mt-1 text-foreground">
                  <VolumeFlow value={asset.volume} />
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 3 — Human explanation */}
          <BentoCard className="md:col-span-3">
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              <Brain className="size-3.5" />
              The human explanation
            </span>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">{asset.explanation}</p>
            <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Radio className="size-3" />
              Synthesised from headlines + social telemetry
            </div>
          </BentoCard>

          {/* Metrics */}
          <BentoCard className="md:col-span-3 !p-0 !border-0 !shadow-none !bg-transparent">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProgressMetricCard
                label="Volatility"
                value={asset.volatility}
                icon={Activity}
                tone={asset.volatility > 60 ? "panic" : "ice"}
                hint="Realised 24h band"
              />
              <ProgressMetricCard
                label="Liquidations"
                value={asset.liquidations}
                icon={Flame}
                tone={asset.liquidations > 40 ? "panic" : "ice"}
                hint="Forced-exit pressure"
              />
              <ProgressMetricCard
                label="Social velocity"
                value={asset.socialVelocity}
                icon={Zap}
                tone={isPanic ? "panic" : "ice"}
                hint="Mentions per minute index"
              />
              <ProgressMetricCard
                label="Calm aura"
                value={Math.max(0, 100 - asset.volatility)}
                icon={Waves}
                tone="ice"
                hint="Inverse of chaos signal"
              />
            </div>
          </BentoCard>

          {/* Card 4 — Evidence drawer */}
          <BentoCard className="md:col-span-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Evidence drawer
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {asset.evidence.length} signals
              </span>
            </div>

            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {asset.evidence.map((item) => (
                <li
                  key={item.text}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-raised/60 p-3.5"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {item.source}
                    </span>
                    <p className="mt-1.5 text-sm leading-snug text-foreground/90">{item.text}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      TAG_STYLES[item.tag],
                    )}
                  >
                    {item.tag}
                  </span>
                </li>
              ))}
            </ul>
          </BentoCard>
        </BentoGrid>

        <footer className="mt-14 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          TEMPO · simulated telemetry for demonstration · not investment advice
        </footer>
      </section>
    </main>
  );
}
