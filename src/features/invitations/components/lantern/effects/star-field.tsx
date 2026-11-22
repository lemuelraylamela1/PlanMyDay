"use client";

import * as React from "react";
import {
  useLanternPerf,
  useMainEffectsActive,
} from "../performance/lantern-perf-provider";
import { scaleEffectCount } from "../performance/profiles";

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  color: string;
};

const STAR_COLORS = ["#ffffff", "#fce8ef", "#ffdf70", "#e8c880", "#f5c0cf"];

/** Deterministic 0–1 value per star so rebuilds (quality change, rotate) keep the same sky. */
function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 57.3 + salt * 149.9) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Canvas twinkling star field for dark night-sky sections.
 * Parallax: stars shift vertically at a gentle rate as the page scrolls.
 */
export function StarField({
  count = 280,
  parallaxFactor = 0.08,
  className,
  /** When false, RAF stops (used while main content is hidden under the gate). */
  active: activeProp,
}: {
  count?: number;
  parallaxFactor?: number;
  className?: string;
  active?: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const scrollRef = React.useRef(0);
  const { profile, compact } = useLanternPerf();
  const mainActive = useMainEffectsActive();
  const active = activeProp ?? mainActive;
  const effectiveCount = scaleEffectCount(count, profile.starScale, compact, 40);
  const glow = profile.starGlow;
  const maxDpr = profile.maxDpr;
  const parallax = parallaxFactor * profile.parallax;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let visible = true;

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const n = Math.min(500, Math.max(40, effectiveCount));
      stars = Array.from({ length: n }, (_, i) => ({
        x: seededUnit(i, 1) * w,
        y: seededUnit(i, 2) * h,
        r: seededUnit(i, 3) * 1.3 + 0.3,
        baseAlpha: seededUnit(i, 4) * 0.5 + 0.35,
        phase: seededUnit(i, 5) * Math.PI * 2,
        speed: seededUnit(i, 6) * 0.018 + 0.006,
        color: STAR_COLORS[Math.floor(seededUnit(i, 7) * STAR_COLORS.length)] ?? "#ffffff",
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const scrollOffset = scrollRef.current * parallax;

      for (const s of stars) {
        if (!reduce) s.phase += s.speed;
        const alpha = s.baseAlpha * (0.55 + 0.45 * Math.sin(s.phase));
        const y = ((s.y - scrollOffset) % h + h) % h;

        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        if (glow) {
          ctx.shadowBlur = s.r * 5;
          ctx.shadowColor = "#ffdf70";
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (!reduce && visible && active) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const onResize = () => {
      // Phones fire resize whenever the address bar slides in/out while
      // scrolling. Resetting the canvas then cleared and redrew every star
      // (flicker). Only rebuild on a real width change (rotation, desktop resize).
      if (canvas.clientWidth === w) return;
      cancelAnimationFrame(raf);
      raf = 0;
      build();
      if (visible && active) draw();
      else if (visible) draw();
    };

    build();
    if (active) draw();
    else {
      // Static first frame so the canvas isn't blank when briefly shown.
      draw();
      cancelAnimationFrame(raf);
      raf = 0;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible && active) {
          if (!raf && !reduce) draw();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(canvas);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [effectiveCount, parallax, glow, maxDpr, active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
