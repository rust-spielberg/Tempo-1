import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Check,
  Flame,
  Gauge,
  Plus,
  Radar,
  Radio,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { ChangeFlow, PriceFlow, VolumeFlow } from "@/components/ui/number-flow-trading";
import { ProgressMetricCard } from "@/components/ui/progress-metric-card";
import {
  ASSETS,
  DEFAULT_WATCHLIST_IDS,
  vibeLabel,
  type Asset,
  type EvidenceTag,
} from "@/lib/tempo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "TEMPO Playground — Asset Vibe Scores" },
      {
        name: "description",
        content:
          "TEMPO translates market chaos and live sentiment telemetry into human emotional metrics, with a psychological Vibe Score for every asset.",
      },
      { property: "og:title", content: "TEMPO Playground — Asset Vibe Scores" },
      {
        property: "og:description",
        content:
          "A cyberpunk sentiment terminal: Vibe Scores, live price telemetry and human explanations for why the market feels the way it does.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlaygroundPage,
});

const TAG_STYLES: Record<EvidenceTag, string> = {
  Bullish: "border-ice/35 bg-ice/10 text-ice",
  Bearish: "border-panic/40 bg-panic/10 text-panic",
  FUD: "border-border bg-secondary text-muted-foreground",
};

const TRENDING_ASSETS = [
  "crypto-btc",
  "crypto-eth",
  "crypto-sol",
  "crypto-doge",
  "forex-eur-usd",
  "forex-gbp-usd",
].flatMap((id) => ASSETS.find((item) => item.id === id) ?? []);

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
          change: Number(
            (((price - anchor.price) / anchor.price) * 100 + anchor.change).toFixed(2),
          ),
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

function PlaygroundPage() {
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST_IDS);
  const [selectedId, setSelectedId] = useState(DEFAULT_WATCHLIST_IDS[0]!);
  const [watchlistLoaded, setWatchlistLoaded] = useState(false);
  const [galleryApi, setGalleryApi] = useState<CarouselApi>();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("tempo-watchlist");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validIds = parsed.filter(
            (id): id is string => typeof id === "string" && ASSETS.some((item) => item.id === id),
          );
          setWatchlist(validIds);
          if (validIds[0]) setSelectedId(validIds[0]);
        }
      }
    } catch {
      window.localStorage.removeItem("tempo-watchlist");
    }
    setWatchlistLoaded(true);
  }, []);

  useEffect(() => {
    if (watchlistLoaded) {
      window.localStorage.setItem("tempo-watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist, watchlistLoaded]);

  useEffect(() => {
    if (!galleryApi) return;

    const syncSelection = () => {
      const index = galleryApi.selectedScrollSnap();
      setGalleryIndex(index);
      const currentAsset = TRENDING_ASSETS[index];
      if (currentAsset) setSelectedId(currentAsset.id);
    };

    syncSelection();
    galleryApi.on("select", syncSelection);
    galleryApi.on("reInit", syncSelection);
    return () => {
      galleryApi.off("select", syncSelection);
      galleryApi.off("reInit", syncSelection);
    };
  }, [galleryApi]);

  useEffect(() => {
    if (!galleryApi || autoplayPaused) return;

    const interval = window.setInterval(() => galleryApi.scrollNext(), 5000);
    return () => window.clearInterval(interval);
  }, [galleryApi, autoplayPaused]);

  const selectedBase = useMemo(
    () =>
      ASSETS.find((a) => a.id === selectedId) ??
      ASSETS.find((a) => watchlist.includes(a.id)) ??
      ASSETS[0]!,
    [selectedId, watchlist],
  );
  const asset = useLiveAsset(selectedBase);
  const vibe = vibeLabel(asset.vibe);
  const isPanic = vibe.tone === "panic";

  const toggleWatchlist = (id: string) => {
    setWatchlist((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <main className="relative min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-8 sm:px-8">
        <Link
          to="/"
          className="font-display text-sm font-bold tracking-widest-xl text-gradient-ice"
        >
          TEMPO
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {ASSETS.length} instruments · simulated live
        </span>
      </nav>
      {/* ---------------- PLAYGROUND ---------------- */}
      <section id="terminal" className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
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

          <MultiSelectCombobox assets={ASSETS} value={watchlist} onChange={setWatchlist} />
        </header>

        <section aria-labelledby="market-pulse-heading" className="mb-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="size-3.5 text-ice" />
                Cross-market radar
              </span>
              <h2 id="market-pulse-heading" className="mt-1 font-display text-xl font-semibold">
                Trending instruments
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Drag or select a market
              </span>
              <button
                type="button"
                aria-label="Previous trending instrument"
                onClick={() => galleryApi?.scrollPrev()}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-ice/40 hover:text-ice"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next trending instrument"
                onClick={() => galleryApi?.scrollNext()}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-ice/40 hover:text-ice"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
          <Carousel
            setApi={setGalleryApi}
            opts={{ align: "center", containScroll: false, loop: true, duration: 36 }}
            className="relative -mx-5 cursor-grab touch-pan-y before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-20 before:w-8 before:bg-gradient-to-r before:from-background before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-20 after:w-8 after:bg-gradient-to-l after:from-background after:to-transparent active:cursor-grabbing sm:-mx-8 sm:before:w-14 sm:after:w-14"
            onMouseEnter={() => setAutoplayPaused(true)}
            onMouseLeave={() => setAutoplayPaused(false)}
            onPointerDown={(event) => {
              if (event.pointerType === "touch") setAutoplayPaused(true);
            }}
            onPointerUp={(event) => {
              if (event.pointerType === "touch") setAutoplayPaused(false);
            }}
          >
            <CarouselContent className="items-center py-7 sm:py-9">
              {TRENDING_ASSETS.map((item, index) => {
                const selected = item.id === selectedId;
                const centered = index === galleryIndex;
                const tracked = watchlist.includes(item.id);
                const displayPrice = selected ? asset.price : item.price;
                const displayChange = selected ? asset.change : item.change;
                const positive = displayChange >= 0;
                const points = item.sparkline;
                const min = Math.min(...points);
                const max = Math.max(...points);
                const line = points
                  .map(
                    (point, index) =>
                      `${(index / (points.length - 1)) * 100},${30 - ((point - min) / (max - min || 1)) * 26}`,
                  )
                  .join(" ");
                return (
                  <CarouselItem
                    key={item.id}
                    className="basis-[82%] pl-3 sm:basis-[48%] sm:pl-4 lg:basis-[36%]"
                  >
                    <article
                      className={cn(
                        "group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-lg border bg-obsidian p-5 transition-[transform,opacity,filter,border-color] duration-500 ease-out sm:min-h-[380px] sm:p-6",
                        centered
                          ? "z-10 scale-100 border-ice/45 opacity-100 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)]"
                          : "scale-[0.88] border-border opacity-65 grayscale-[0.25]",
                        selected && "ring-1 ring-ice/20",
                      )}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--ice)_14%,transparent),transparent_58%),linear-gradient(155deg,color-mix(in_oklab,var(--surface-raised)_72%,transparent),transparent_68%)]" />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute -right-4 top-5 select-none font-display text-[6rem] font-bold leading-none opacity-[0.32] sm:text-[7rem]",
                          positive ? "text-ice" : "text-panic",
                        )}
                      >
                        {item.symbol.replaceAll("/", "")}
                      </span>
                      <div className="relative flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(item.id);
                            galleryApi?.scrollTo(index);
                          }}
                          className="min-w-0 text-left"
                        >
                          <span className="mb-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                positive ? "bg-ice" : "bg-panic",
                              )}
                            />
                            {item.category === "crypto" ? "Crypto market" : "Forex market"}
                          </span>
                          <span className="block font-display text-xl font-semibold tracking-wide sm:text-2xl">
                            {item.symbol}
                          </span>
                          <span className="mt-1 block truncate text-xs text-muted-foreground">
                            {item.name}
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={`${tracked ? "Remove" : "Add"} ${item.symbol} ${tracked ? "from" : "to"} watchlist`}
                          onClick={() => toggleWatchlist(item.id)}
                          className={cn(
                            "relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                            tracked
                              ? "border-ice/40 bg-ice/10 text-ice"
                              : "border-foreground/20 bg-foreground text-obsidian hover:bg-ice",
                          )}
                        >
                          {tracked ? <Check className="size-4" /> : <Plus className="size-4" />}
                        </button>
                      </div>

                      <div className="relative mt-auto pt-10">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                              Live price
                            </span>
                            <span className="mt-1 block font-mono text-2xl font-medium tabular-nums sm:text-3xl">
                              {displayPrice < 1
                                ? displayPrice.toPrecision(4)
                                : displayPrice.toLocaleString("en-US", {
                                    maximumFractionDigits: 2,
                                  })}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "mb-1 rounded-sm border px-2 py-1 font-mono text-[11px] tabular-nums",
                              positive
                                ? "border-ice/25 bg-ice/10 text-ice"
                                : "border-panic/30 bg-panic/10 text-panic",
                            )}
                          >
                            {positive ? "+" : ""}
                            {displayChange.toFixed(2)}%
                          </span>
                        </div>
                        <svg
                          viewBox="0 0 100 32"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                          className="mt-5 h-12 w-full overflow-visible"
                        >
                          <polyline
                            points={line}
                            fill="none"
                            stroke={positive ? "var(--ice)" : "var(--panic)"}
                            strokeWidth="1.8"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                      <div className="relative mt-4 flex items-center justify-between border-t border-border/70 pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                        <span>
                          Vibe {item.vibe} · {positive ? "Accumulation" : "Volatility"}
                        </span>
                        <ArrowUpRight className="size-3 opacity-70" />
                      </div>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </section>

        <div className="mb-6 flex min-h-9 flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Watchlist
          </span>
          {watchlist.length ? (
            watchlist.map((id) => {
              const item = ASSETS.find((candidate) => candidate.id === id);
              if (!item) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className={cn(
                    "rounded-sm border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
                    selectedId === id
                      ? "border-ice/45 bg-ice/10 text-ice"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.symbol}
                </button>
              );
            })
          ) : (
            <span className="text-xs text-muted-foreground">
              Add instruments to start tracking.
            </span>
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
              <PriceFlow value={asset.price} className={isPanic ? "text-panic" : "text-ice"} />
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
