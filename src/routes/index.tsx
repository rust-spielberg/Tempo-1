import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { ReactiveGlowGrid } from "@/components/ui/reactive-glow-grid";

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
          "Vibe Scores, live price telemetry and human explanations for why the market feels the way it does.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-obsidian">
      <ReactiveGlowGrid />

      <div className="animate-in fade-in slide-in-from-bottom-4 pointer-events-none relative z-10 flex flex-col items-center px-6 text-center duration-700">
        <span className="font-display text-7xl font-extrabold uppercase tracking-[0.2em] sm:text-8xl md:text-9xl">
          <span className="bg-[linear-gradient(90deg,#22C55E_0%,#7DF9FF_32%,#fff_50%,#7DF9FF_68%,#EF4444_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(125,249,255,0.3)]">
            TEMPO
          </span>
        </span>
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
