import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { GravityStars } from "@/components/ui/gravity-stars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TEMPO — The whole sky leans towards your cursor" },
      {
        name: "description",
        content:
          "TEMPO translates market chaos and live sentiment telemetry into human emotional metrics, with a psychological Vibe Score for every asset.",
      },
      { property: "og:title", content: "TEMPO — Live Market Sentiment Radar" },
      {
        property: "og:description",
        content: "Vibe Scores, live price telemetry and human explanations for why the market feels the way it does.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-obsidian">
      <GravityStars />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_50%,transparent_0%,var(--obsidian)_100%)]" />

      <div className="animate-in fade-in slide-in-from-bottom-4 pointer-events-none relative z-10 flex flex-col items-center px-6 text-center duration-700">
        <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-mono-dim">TEMPO</span>
        <h1 className="mt-6 max-w-4xl text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight text-mono sm:text-6xl md:text-7xl">
          The whole sky leans towards your cursor.
        </h1>
        <p className="mt-6 max-w-xl text-balance text-sm leading-relaxed text-mono-dim sm:text-base">
          Translating market chaos and live sentiment telemetry into human emotional metrics.
        </p>
        <Link
          to="/playground"
          className="pointer-events-auto mt-10 inline-flex items-center gap-3 rounded-md border border-mono bg-mono px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-obsidian transition-all duration-300 hover:bg-transparent hover:text-mono"
        >
          Enter Playground
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}
