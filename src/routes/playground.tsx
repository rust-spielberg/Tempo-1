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
  Settings2,
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
  assetPriceFractionDigits,
  assetQuoteCurrency,
  changeSentiment,
  displayPriceFractionDigits,
  fetchExchangeRate,
  formatAssetPrice,
  getSupportedCurrencies,
  vibeLabel,
  type Asset,
  type EvidenceTag,
  type SentimentTone,
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
  Bullish: "border-bullish/35 bg-bullish/10 text-bullish",
  Bearish: "border-panic/40 bg-panic/10 text-panic",
  FUD: "border-panic/30 bg-panic/5 text-panic",
};

const FALLBACK_CURRENCIES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  INR: "Indian Rupee",
  SGD: "Singapore Dollar",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
};

const SENTIMENT_STYLES: Record<
  SentimentTone,
  { text: string; bg: string; border: string; fill: string; glow: string; ring: string }
> = {
  bullish: {
    text: "text-bullish",
    bg: "bg-bullish/10",
    border: "border-bullish/45",
    fill: "bg-bullish",
    glow: "bg-bullish/35",
    ring: "ring-bullish/20",
  },
  neutral: {
    text: "text-ice",
    bg: "bg-ice/10",
    border: "border-ice/45",
    fill: "bg-ice",
    glow: "bg-ice/35",
    ring: "ring-ice/20",
  },
  panic: {
    text: "text-panic",
    bg: "bg-panic/10",
    border: "border-panic/45",
    fill: "bg-panic",
    glow: "bg-panic/40",
    ring: "ring-panic/20",
  },
};

const TRENDING_ASSETS = [
  "crypto-btc",
  "crypto-eth",
  "crypto-sol",
  "crypto-doge",
  "forex-eur-usd",
  "forex-gbp-usd",
].flatMap((id) => ASSETS.find((item) => item.id === id) ?? []);

function isPersistedAsset(value: unknown): value is Asset {
  if (!value || typeof value !== "object") return false;
  const asset = value as Partial<Asset>;
  return (
    typeof asset.id === "string" &&
    typeof asset.symbol === "string" &&
    typeof asset.name === "string" &&
    (asset.category === "crypto" || asset.category === "forex") &&
    typeof asset.price === "number" &&
    Number.isFinite(asset.price) &&
    typeof asset.change === "number" &&
    Number.isFinite(asset.change) &&
    Array.isArray(asset.sparkline) &&
    asset.sparkline.every((point) => typeof point === "number" && Number.isFinite(point)) &&
    typeof asset.volume === "number" &&
    (asset.volumeAvailable === undefined || typeof asset.volumeAvailable === "boolean") &&
    typeof asset.vibe === "number" &&
    typeof asset.liquidations === "number" &&
    typeof asset.volatility === "number" &&
    typeof asset.socialVelocity === "number" &&
    typeof asset.explanation === "string" &&
    Array.isArray(asset.evidence) &&
    asset.evidence.every(
      (item) =>
        !!item &&
        typeof item.source === "string" &&
        typeof item.text === "string" &&
        (item.tag === "Bullish" || item.tag === "Bearish" || item.tag === "FUD"),
    ) &&
    (asset.provider === "coingecko" || asset.provider === "frankfurter")
  );
}

function readSavedWatchlist() {
  try {
    const stored = window.localStorage.getItem("tempo-watchlist");
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    const savedCustomAssets: unknown = JSON.parse(
      window.localStorage.getItem("tempo-watchlist-assets") ?? "[]",
    );
    const customAssets = Array.isArray(savedCustomAssets)
      ? savedCustomAssets.filter(isPersistedAsset)
      : [];
    const knownIds = new Set([...ASSETS, ...customAssets].map((asset) => asset.id));
    return {
      ids: [
        ...new Set(parsed.filter((id): id is string => typeof id === "string" && knownIds.has(id))),
      ],
      customAssets,
    };
  } catch {
    return null;
  }
}

function saveWatchlist(ids: string[], customAssets: Asset[]) {
  try {
    window.localStorage.setItem("tempo-watchlist", JSON.stringify(ids));
    window.localStorage.setItem("tempo-watchlist-assets", JSON.stringify(customAssets));
  } catch {
    return;
  }
}

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
          volume:
            anchor.volumeAvailable === false
              ? 0
              : Math.max(1, anchor.volume * (0.94 + Math.random() * 0.12)),
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

function AssetSelectionView({
  assets,
  watchlist,
  onChange,
  onContinue,
  onResolveAsset,
}: {
  assets: Asset[];
  watchlist: string[];
  onChange: (ids: string[]) => void;
  onContinue: () => void;
  onResolveAsset: (asset: Asset) => void;
}) {
  const [galleryApi, setGalleryApi] = useState<CarouselApi>();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  useEffect(() => {
    if (!galleryApi) return;

    const syncIndex = () => setGalleryIndex(galleryApi.selectedScrollSnap());
    syncIndex();
    galleryApi.on("select", syncIndex);
    galleryApi.on("reInit", syncIndex);
    return () => {
      galleryApi.off("select", syncIndex);
      galleryApi.off("reInit", syncIndex);
    };
  }, [galleryApi]);

  useEffect(() => {
    if (!galleryApi || autoplayPaused) return;

    const interval = window.setInterval(() => galleryApi.scrollNext(), 3000);
    return () => window.clearInterval(interval);
  }, [galleryApi, autoplayPaused]);

  const toggleWatchlist = (id: string) => {
    onChange(watchlist.includes(id) ? watchlist.filter((item) => item !== id) : [...watchlist, id]);
  };

  return (
    <>
      <section className="relative mx-auto w-full max-w-6xl px-5 pb-36 pt-12 sm:px-8 sm:pt-16">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-ice">
              <Radar className="size-3.5" />
              Build your signal desk
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose what moves your tape.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Browse the trending markets or search the full instrument list to build your
              watchlist.
            </p>
          </div>
          <MultiSelectCombobox
            assets={assets}
            value={watchlist}
            onChange={onChange}
            onResolveAsset={onResolveAsset}
          />
        </header>

        <section aria-labelledby="market-pulse-heading">
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
                const tracked = watchlist.includes(item.id);
                const centered = index === galleryIndex;
                const itemTone = vibeLabel(item.vibe).tone;
                const itemStyles = SENTIMENT_STYLES[itemTone];
                const itemChangeTone = changeSentiment(item.change);
                const changeStyles = SENTIMENT_STYLES[itemChangeTone];
                const min = Math.min(...item.sparkline);
                const max = Math.max(...item.sparkline);
                const line = item.sparkline
                  .map(
                    (point, pointIndex) =>
                      `${(pointIndex / (item.sparkline.length - 1)) * 100},${30 - ((point - min) / (max - min || 1)) * 26}`,
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
                          ? cn(
                              "z-10 scale-100 opacity-100 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)]",
                              itemStyles.border,
                            )
                          : "scale-[0.88] border-border opacity-65 grayscale-[0.25]",
                        tracked && cn("ring-1", itemStyles.ring),
                      )}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--ice)_14%,transparent),transparent_58%),linear-gradient(155deg,color-mix(in_oklab,var(--surface-raised)_72%,transparent),transparent_68%)]" />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute -right-4 top-5 select-none font-display text-[6rem] font-bold leading-none opacity-[0.32] sm:text-[7rem]",
                          itemStyles.text,
                        )}
                      >
                        {item.symbol.replaceAll("/", "")}
                      </span>
                      <div className="relative flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => galleryApi?.scrollTo(index)}
                          className="min-w-0 text-left"
                        >
                          <span className="mb-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span className={cn("size-1.5 rounded-full", changeStyles.fill)} />
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
                              Market price
                            </span>
                            <span className="mt-1 block font-mono text-2xl font-medium tabular-nums sm:text-3xl">
                              {formatAssetPrice(item)}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "mb-1 rounded-sm border px-2 py-1 font-mono text-[11px] tabular-nums",
                              changeStyles.border,
                              changeStyles.bg,
                              changeStyles.text,
                            )}
                          >
                            {item.change > 0 ? "+" : ""}
                            {item.change.toFixed(2)}%
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
                            stroke={
                              itemChangeTone === "bullish"
                                ? "var(--bullish)"
                                : itemChangeTone === "panic"
                                  ? "var(--panic)"
                                  : "var(--ice)"
                            }
                            strokeWidth="1.8"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                      <div className="relative mt-4 flex items-center justify-between border-t border-border/70 pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                        <span className={itemStyles.text}>
                          Vibe {item.vibe} · {vibeLabel(item.vibe).label}
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
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <span className="text-ice">{watchlist.length}</span> instruments selected
          </p>
          <button
            type="button"
            disabled={watchlist.length === 0}
            onClick={onContinue}
            className="inline-flex min-h-11 items-center gap-3 rounded-md bg-ice px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-obsidian transition-colors hover:bg-ice/85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Your Watchlist
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

function PlaygroundPage() {
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST_IDS);
  const [customAssets, setCustomAssets] = useState<Asset[]>([]);
  const [terminalWatchlistIds, setTerminalWatchlistIds] = useState<string[] | null>(null);
  const [screen, setScreen] = useState<"selection" | "terminal">("selection");
  const [selectedId, setSelectedId] = useState(DEFAULT_WATCHLIST_IDS[0]!);
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [currencyOptions, setCurrencyOptions] = useState(FALLBACK_CURRENCIES);
  const [conversionRate, setConversionRate] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState(false);

  useEffect(() => {
    const savedIds = readSavedWatchlist();
    if (!savedIds) return;
    setCustomAssets(savedIds.customAssets);
    setWatchlist(savedIds.ids);
    if (savedIds.ids[0]) setSelectedId(savedIds.ids[0]);
  }, []);

  useEffect(() => {
    let active = true;
    getSupportedCurrencies()
      .then((supported) => {
        if (active) setCurrencyOptions({ ...FALLBACK_CURRENCIES, ...supported });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const availableAssets = useMemo(() => [...ASSETS, ...customAssets], [customAssets]);
  const terminalWatchlist = useMemo(
    () =>
      (terminalWatchlistIds ?? []).flatMap((id) =>
        availableAssets.filter((item) => item.id === id),
      ),
    [availableAssets, terminalWatchlistIds],
  );
  const selectedBase = useMemo(
    () =>
      terminalWatchlist.find((assetItem) => assetItem.id === selectedId) ??
      terminalWatchlist[0] ??
      ASSETS[0]!,
    [selectedId, terminalWatchlist],
  );
  const sourceCurrency = assetQuoteCurrency(selectedBase);

  const currencyCodes = useMemo(() => {
    const priority = ["USD", "EUR", "INR", "SGD", "GBP", "JPY"];
    return Object.keys(currencyOptions).sort((left, right) => {
      const leftRank = priority.indexOf(left);
      const rightRank = priority.indexOf(right);
      return (
        (leftRank < 0 ? priority.length : leftRank) -
          (rightRank < 0 ? priority.length : rightRank) || left.localeCompare(right)
      );
    });
  }, [currencyOptions]);

  useEffect(() => {
    if (screen !== "terminal") return;

    const controller = new AbortController();
    setConversionRate(1);
    setConversionError(false);
    if (sourceCurrency === displayCurrency) {
      setIsConverting(false);
      return;
    }

    setIsConverting(true);
    const timeout = window.setTimeout(() => {
      setConversionError(true);
      setIsConverting(false);
      controller.abort();
    }, 8000);

    fetchExchangeRate(sourceCurrency, displayCurrency, controller.signal)
      .then((rate) => {
        if (!controller.signal.aborted) setConversionRate(rate);
      })
      .catch(() => {
        if (!controller.signal.aborted) setConversionError(true);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!controller.signal.aborted) setIsConverting(false);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [displayCurrency, screen, sourceCurrency]);

  const asset = useLiveAsset(selectedBase);
  const vibe = vibeLabel(asset.vibe);
  const isPanic = vibe.tone === "panic";
  const vibeStyles = SENTIMENT_STYLES[vibe.tone];
  const appliedCurrency = isConverting || conversionError ? sourceCurrency : displayCurrency;
  const appliedRate = isConverting || conversionError ? 1 : conversionRate;
  const displayedPrice = asset.price * appliedRate;

  const openTerminal = () => {
    if (watchlist.length === 0) return;
    const finalizedIds = [...watchlist];
    const firstId = finalizedIds[0]!;
    setTerminalWatchlistIds(finalizedIds);
    setSelectedId((current) => (finalizedIds.includes(current) ? current : firstId));
    saveWatchlist(
      finalizedIds,
      customAssets.filter((customAsset) => finalizedIds.includes(customAsset.id)),
    );
    setScreen("terminal");
  };

  if (screen === "selection") {
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
        <AssetSelectionView
          assets={availableAssets}
          watchlist={watchlist}
          onChange={setWatchlist}
          onContinue={openTerminal}
          onResolveAsset={(asset) => {
            setSelectedId(asset.id);
            if (!asset.provider) return;
            setCustomAssets((current) => [
              ...current.filter((item) => item.id !== asset.id),
              asset,
            ]);
          }}
        />
      </main>
    );
  }

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

          <button
            type="button"
            onClick={() => {
              setWatchlist(terminalWatchlistIds ?? []);
              setScreen("selection");
            }}
            className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-border bg-surface px-3 text-xs uppercase tracking-[0.12em] text-foreground transition-colors hover:border-ice/40 hover:bg-surface-raised md:self-auto"
          >
            <Settings2 className="size-4" />
            Customize watchlist
          </button>
        </header>

        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
          <section className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Display currency
            </span>
            <div
              role="group"
              aria-label="Display currency"
              className="scrollbar-none mt-2 flex gap-1.5 overflow-x-auto pb-1"
            >
              {currencyCodes.map((currency) => (
                <button
                  key={currency}
                  type="button"
                  title={`${currency} · ${currencyOptions[currency]}`}
                  aria-label={`Display in ${currencyOptions[currency]} (${currency})`}
                  aria-pressed={displayCurrency === currency}
                  onClick={() => setDisplayCurrency(currency)}
                  className={cn(
                    "shrink-0 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
                    displayCurrency === currency
                      ? "border-ice/45 bg-ice/10 text-ice"
                      : "border-border bg-surface text-muted-foreground hover:border-ice/30 hover:text-foreground",
                  )}
                >
                  {currency}
                </button>
              ))}
            </div>
            {isConverting ? (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Updating {sourceCurrency}/{displayCurrency} rate...
              </p>
            ) : conversionError ? (
              <p role="status" className="mt-1 text-[10px] text-panic">
                Rate unavailable; showing {sourceCurrency}.
              </p>
            ) : null}
          </section>

          <section className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Watchlist
            </span>
            <div className="scrollbar-none mt-2 flex gap-2 overflow-x-auto pb-1">
              {terminalWatchlist.map((item) => {
                const id = item.id;
                const itemStyles = SENTIMENT_STYLES[vibeLabel(item.vibe).tone];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedId(id)}
                    className={cn(
                      "shrink-0 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
                      selectedId === id
                        ? cn(itemStyles.border, itemStyles.bg, itemStyles.text)
                        : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.symbol}
                  </button>
                );
              })}
            </div>
          </section>
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
                      vibeStyles.text,
                    )}
                  >
                    {Math.round(asset.vibe)}
                  </span>
                  <span className="pb-2 font-mono text-sm text-muted-foreground">/ 100</span>
                </div>
                <span
                  className={cn(
                    "mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
                    vibeStyles.border,
                    vibeStyles.bg,
                    vibeStyles.text,
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
                    vibeStyles.glow,
                  )}
                />
                <div
                  className={cn(
                    "relative flex size-20 items-center justify-center rounded-full border",
                    vibeStyles.border,
                  )}
                >
                  <Gauge className={cn("size-8", vibeStyles.text)} />
                </div>
              </div>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-out",
                  vibeStyles.fill,
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
          <BentoCard tone={changeSentiment(asset.change)} className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Live ticker
            </span>
            <div className="mt-4 flex flex-col gap-3">
              <PriceFlow
                value={displayedPrice}
                currency={appliedCurrency}
                maximumFractionDigits={displayPriceFractionDigits(
                  asset,
                  appliedCurrency,
                  displayedPrice,
                )}
                className={SENTIMENT_STYLES[changeSentiment(asset.change)].text}
              />
              <ChangeFlow value={asset.change} className="self-start" />
              <div className="mt-2 border-t border-border pt-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  24h volume
                </span>
                <div className="mt-1 text-foreground">
                  {asset.volumeAvailable === false ? (
                    <span className="font-mono text-sm text-muted-foreground">Unavailable</span>
                  ) : (
                    <VolumeFlow value={asset.volume * appliedRate} currency={appliedCurrency} />
                  )}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 3 — Human explanation */}
          <BentoCard tone={vibe.tone} className="md:col-span-3">
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
                tone={asset.volatility > 60 ? "panic" : "neutral"}
                hint="Realised 24h band"
              />
              <ProgressMetricCard
                label="Liquidations"
                value={asset.liquidations}
                icon={Flame}
                tone={asset.liquidations > 40 ? "panic" : "neutral"}
                hint="Forced-exit pressure"
              />
              <ProgressMetricCard
                label="Social velocity"
                value={asset.socialVelocity}
                icon={Zap}
                tone={vibe.tone}
                hint="Mentions per minute index"
              />
              <ProgressMetricCard
                label="Calm aura"
                value={Math.max(0, 100 - asset.volatility)}
                icon={Waves}
                tone={asset.volatility > 60 ? "panic" : "bullish"}
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
