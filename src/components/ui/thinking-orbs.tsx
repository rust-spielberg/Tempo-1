import { ThinkingOrb } from "thinking-orbs";

type ThinkingOrbsProps = {
  label?: string;
  paused?: boolean;
};

export function ThinkingOrbs({ label = "Analyzing Tape…", paused = false }: ThinkingOrbsProps) {
  return (
    <div className="tempo-loading-pill" role="status" aria-live="polite">
      <ThinkingOrb state="working" size={32} theme="dark" paused={paused} aria-label={label} />
      <span>{label}</span>
    </div>
  );
}
