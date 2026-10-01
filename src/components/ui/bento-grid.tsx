import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { SentimentTone } from "@/lib/tempo-data";

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.09 } },
      }}
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-6", className)}
    >
      {children}
    </motion.div>
  );
}

export function BentoCard({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: SentimentTone;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={cn(
        "panel relative overflow-hidden p-5 transition-shadow duration-500",
        tone === "bullish" && "border-bullish/30 glow-bullish",
        tone === "neutral" && "border-ice/30 glow-ice",
        tone === "panic" && "border-panic/30 glow-panic",
        className,
      )}
    >
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
