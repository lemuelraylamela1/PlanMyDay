"use client";

import * as React from "react";
import { useLanternPerf } from "../performance/lantern-perf-provider";
import { scaleParticleDensity } from "../performance/profiles";

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  baseAlpha: number;
  twinkle: number;
  twinkleSpeed: number;
  color: string;
};

const COLORS = ["#ddbf8d", "#f7e3e8", "#ffffff", "#e8b8c7"];

/**
 * Ambient floating particles + soft bokeh + twinkling stars on a canvas.
 * Respects prefers-reduced-motion (renders a calm static field).
 */
export function ParticleField({
  density = 0.00012,
  className,
  interactive = false,
}: {
  density?: number;
  className?: string;
  interactive?: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { profile } = useLanternPerf();
  const effectiveDensity = scaleParticleDensity(density, profile.particleDensityScale);
  const glow = profile.starGlow;
  const maxDpr = profile.maxDpr;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        160,
        Math.max(16, Math.floor(width * height * effectiveDensity)),
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.5,
        vy: -(Math.random() * 0.25 + 0.04),
        vx: (Math.random() - 0.5) * 0.18,
        baseAlpha: Math.random() * 0.5 + 0.25,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#ddbf8d",
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduce) {
          p.y += p.vy;
          p.x += p.vx;
          p.twinkle += p.twinkleSpeed;

          if (interactive) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 90) {
              p.x += (dx / dist) * 0.6;
              p.y += (dy / dist) * 0.6;
            }
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const alpha = reduce
          ? p.baseAlpha
          : p.baseAlpha * (0.5 + 0.5 * Math.sin(p.twinkle));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        if (glow) {
          ctx.shadowBlur = p.r * 4;
          ctx.shadowColor = p.color;
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (!reduce && visible) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    build();
    draw();

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      build();
      if (visible) draw();
    };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) {
          if (!raf && !reduce) draw();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(canvas);

    window.addEventListener("resize", onResize);
    if (interactive) window.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      if (interactive) window.removeEventListener("mousemove", onMove);
    };
  }, [effectiveDensity, interactive, glow, maxDpr]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
