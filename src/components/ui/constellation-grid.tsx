import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

/**
 * Canvas-based cursor-reactive constellation mesh.
 * Colors are read from the design tokens at runtime.
 */
export function ConstellationGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(140, Math.max(48, Math.round((width * height) / 14000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const dx = node.x - pointer.x;
        const dy = node.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0.001) {
          const push = (150 - dist) / 150;
          node.x += (dx / dist) * push * 1.6;
          node.y += (dy / dist) * push * 1.6;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > 130) continue;
          const alpha = (1 - dist / 130) * 0.42;
          ctx.strokeStyle = `rgba(125, 249, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        const near = Math.hypot(node.x - pointer.x, node.y - pointer.y) < 150;
        ctx.fillStyle = near ? "rgba(125, 249, 255, 0.95)" : "rgba(160, 220, 235, 0.55)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, near ? 2.2 : 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}
