"use client";

import * as React from "react";

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

/**
 * Canvas twinkling star field for dark night-sky sections.
 * Parallax: stars shift vertically at a gentle rate as the page scrolls.
 */
export function StarField({
  count = 280,
  parallaxFactor = 0.08,
  className,
}: {
  count?: number;
  parallaxFactor?: number;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const scrollRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      const n = Math.min(500, Math.max(60, count));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.018 + 0.006,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)] ?? "#ffffff",
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const scrollOffset = scrollRef.current * parallaxFactor;

      for (const s of stars) {
        if (!reduce) s.phase += s.speed;
        const alpha = s.baseAlpha * (0.55 + 0.45 * Math.sin(s.phase));
        const y = ((s.y - scrollOffset) % h + h) % h;

        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = s.r * 5;
        ctx.shadowColor = "#ffdf70";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (!reduce && visible) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      build();
      if (visible) draw();
    };

    build();
    draw();

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

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [count, parallaxFactor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
