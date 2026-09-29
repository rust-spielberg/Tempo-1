import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type Star = { x: number; y: number; vx: number; vy: number; hx: number; hy: number };

/**
 * Dense monochrome particle field whose stars and connecting web lean toward the cursor.
 */
export function GravityStars({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const RADIUS = 260;
    const LINK = 110;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(900, Math.max(320, Math.round((width * height) / 1900)));
      stars = Array.from({ length: count }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return { x, y, hx: x, hy: y, vx: 0, vy: 0 };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.hx += (Math.random() - 0.5) * 0.3;
        s.hy += (Math.random() - 0.5) * 0.3;
        let ax = (s.hx - s.x) * 0.012;
        let ay = (s.hy - s.y) * 0.012;
        if (pointer.active) {
          const dx = pointer.x - s.x;
          const dy = pointer.y - s.y;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS && d > 1) {
            const pull = ((RADIUS - d) / RADIUS) ** 2 * 1.4;
            ax += (dx / d) * pull;
            ay += (dy / d) * pull;
          }
        }
        s.vx = (s.vx + ax) * 0.86;
        s.vy = (s.vy + ay) * 0.86;
        s.x += s.vx;
        s.y += s.vy;
      }

      for (let i = 0; i < stars.length; i++) {
        const a = stars[i]!;
        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK) continue;
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * 0.28})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const s of stars) {
        const speed = Math.min(1, Math.hypot(s.vx, s.vy) / 3);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + speed * 0.5})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.1 + speed * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("absolute inset-0 h-full w-full", className)} />;
}
