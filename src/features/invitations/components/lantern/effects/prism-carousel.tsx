"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type PrismCarouselItem = {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
};

export type PrismCarouselHandle = {
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
};

type Props = {
  items: PrismCarouselItem[];
  startIndex?: number;
  aspect?: number;
  neighborScale?: number;
  gap?: number;
  radius?: number;
  saturation?: number;
  dim?: number;
  sweep?: number;
  autoplay?: boolean;
  interval?: number;
  loop?: boolean;
  captions?: boolean;
  controls?: boolean;
  draggable?: boolean;
  wheel?: boolean;
  pauseOnHover?: boolean;
  backgroundColor?: string;
  paused?: boolean;
  ariaLabel?: string;
  titleColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  onIndexChange?: (index: number) => void;
  onSelect?: (item: PrismCarouselItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
};

const DRAG_THRESHOLD = 56;

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export const PrismCarousel = React.forwardRef<PrismCarouselHandle, Props>(
  function PrismCarousel(
    {
      items,
      startIndex = 0,
      aspect = 0.78,
      neighborScale = 0.74,
      gap = 22,
      radius = 22,
      saturation = 0.22,
      dim = 0.32,
      sweep = 1,
      autoplay = true,
      interval = 4.5,
      loop = true,
      captions = true,
      controls = true,
      draggable = true,
      wheel = false,
      pauseOnHover = true,
      backgroundColor = "transparent",
      paused = false,
      ariaLabel = "Attire lookbook carousel. Use arrow keys or swipe to browse roles.",
      titleColor = "#2a1540",
      subtitleColor = "#4a3358",
      accentColor = "#c0607a",
      onIndexChange,
      onSelect,
      className,
      style,
    },
    ref,
  ) {
    const reduceMotion = useReducedMotion();
    const count = items.length;
    const stageRef = React.useRef<HTMLDivElement>(null);
    const [index, setIndex] = React.useState(() =>
      wrapIndex(startIndex, Math.max(count, 1)),
    );
    const [hovering, setHovering] = React.useState(false);
    const [sweepKey, setSweepKey] = React.useState(0);
    const [dragPx, setDragPx] = React.useState(0);
    const [stageWidth, setStageWidth] = React.useState(720);
    const indexRef = React.useRef(index);
    const onIndexChangeRef = React.useRef(onIndexChange);

    React.useEffect(() => {
      indexRef.current = index;
    }, [index]);

    React.useEffect(() => {
      onIndexChangeRef.current = onIndexChange;
    }, [onIndexChange]);

    React.useEffect(() => {
      const node = stageRef.current;
      if (!node) return;
      const measure = () => setStageWidth(node.clientWidth || 720);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const goTo = React.useCallback(
      (nextIndex: number) => {
        if (count === 0) return;
        const clamped = loop
          ? wrapIndex(nextIndex, count)
          : Math.max(0, Math.min(count - 1, nextIndex));
        if (clamped === indexRef.current) return;
        setIndex(clamped);
        setSweepKey((k) => k + 1);
        onIndexChangeRef.current?.(clamped);
      },
      [count, loop],
    );

    const next = React.useCallback(() => {
      goTo(indexRef.current + 1);
    }, [goTo]);

    const previous = React.useCallback(() => {
      goTo(indexRef.current - 1);
    }, [goTo]);

    React.useImperativeHandle(
      ref,
      () => ({
        next,
        previous,
        goTo,
      }),
      [goTo, next, previous],
    );

    React.useEffect(() => {
      if (count === 0) return;
      const safe = wrapIndex(startIndex, count);
      setIndex(safe);
      indexRef.current = safe;
    }, [count, startIndex]);

    const autoplayBlocked =
      paused ||
      reduceMotion ||
      !autoplay ||
      count < 2 ||
      (pauseOnHover && hovering);

    React.useEffect(() => {
      if (autoplayBlocked) return;
      const id = window.setInterval(() => {
        goTo(indexRef.current + 1);
      }, Math.max(1.5, interval) * 1000);
      return () => window.clearInterval(id);
    }, [autoplayBlocked, goTo, interval]);

    const slideWidth = Math.min(Math.max(stageWidth * 0.42, 210), 340);
    const step = slideWidth + gap;

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || count < 2) return;
      if (event.button !== 0) return;

      const startX = event.clientX;
      const startY = event.clientY;
      let axis: "x" | "y" | null = null;
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      const onMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!axis) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          if (axis === "y") return;
        }
        if (axis !== "x") return;
        moveEvent.preventDefault();
        setDragPx(dx);
      };

      const onUp = (upEvent: PointerEvent) => {
        target.releasePointerCapture(upEvent.pointerId);
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);

        const dx = upEvent.clientX - startX;
        setDragPx(0);
        if (axis === "x" && Math.abs(dx) >= DRAG_THRESHOLD) {
          if (dx < 0) next();
          else previous();
        }
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    };

    const onWheel = (event: React.WheelEvent) => {
      if (!wheel || count < 2) return;
      if (
        Math.abs(event.deltaX) < Math.abs(event.deltaY) &&
        Math.abs(event.deltaX) < 8
      ) {
        return;
      }
      event.preventDefault();
      if (event.deltaX > 0 || event.deltaY > 0) next();
      else previous();
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      } else if (event.key === "Enter" || event.key === " ") {
        const item = items[index];
        if (!item) return;
        event.preventDefault();
        onSelect?.(item, index);
        if (item.href) window.location.assign(item.href);
      }
    };

    const active = items[index];
    const allowSweep = sweep > 0 && !reduceMotion && !paused;

    if (count === 0) return null;

    return (
      <div
        className={cn(
          "relative flex min-h-[420px] w-full flex-col outline-none",
          className,
        )}
        style={{ backgroundColor, ...style }}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => pauseOnHover && setHovering(true)}
        onMouseLeave={() => pauseOnHover && setHovering(false)}
        onWheel={onWheel}
      >
        <div
          ref={stageRef}
          className={cn(
            "relative flex flex-1 items-center justify-center overflow-hidden py-4",
            draggable && "touch-pan-y cursor-grab active:cursor-grabbing",
          )}
          style={{ perspective: 1200 }}
          onPointerDown={onPointerDown}
        >
          <div className="relative h-[min(58vw,420px)] w-full max-h-[460px]">
            {items.map((item, i) => {
              const rawOffset = i - index;
              let offset = rawOffset;
              if (loop && count > 2) {
                if (rawOffset > count / 2) offset = rawOffset - count;
                if (rawOffset < -count / 2) offset = rawOffset + count;
              }

              const isActive = offset === 0;
              const abs = Math.abs(offset);
              if (abs > 2) return null;

              const scale = isActive ? 1 : neighborScale * (1 - abs * 0.06);
              const x = offset * step * 0.72 + dragPx * (isActive ? 1 : 0.35);
              const rotateY = offset * -16;
              const zIndex = 30 - abs;
              const opacity = isActive ? 1 : Math.max(0.4, 1 - abs * 0.26);
              const grayscale = isActive ? 0 : 1 - saturation;
              const brightness = isActive ? 1 : 1 - dim;

              return (
                <motion.button
                  key={`${item.src}-${i}`}
                  type="button"
                  aria-label={item.title ?? item.alt}
                  aria-current={isActive ? "true" : undefined}
                  className="absolute left-1/2 top-1/2 overflow-hidden border-0 bg-transparent p-0 shadow-[0_28px_60px_-36px_rgba(96,40,60,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--color-lantern,#f4c444)]"
                  style={{
                    width: slideWidth,
                    aspectRatio: String(aspect),
                    borderRadius: radius,
                    zIndex,
                    WebkitTapHighlightColor: "transparent",
                    transformStyle: "preserve-3d",
                  }}
                  initial={false}
                  animate={{
                    x: x - slideWidth / 2,
                    y: "-50%",
                    scale,
                    rotateY,
                    opacity,
                    filter: `grayscale(${grayscale}) brightness(${brightness})`,
                  }}
                  transition={
                    reduceMotion || dragPx !== 0
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 280, damping: 30 }
                  }
                  onClick={() => {
                    if (Math.abs(dragPx) > 8) return;
                    if (isActive) {
                      onSelect?.(item, i);
                      if (item.href) window.location.assign(item.href);
                      return;
                    }
                    goTo(i);
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 70vw, 360px"
                    className="pointer-events-none select-none object-cover object-[50%_18%]"
                    draggable={false}
                    priority={isActive}
                  />

                  {isActive && allowSweep ? (
                    <motion.span
                      key={sweepKey}
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 w-[44%] mix-blend-soft-light"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(245,192,207,0.55) 28%, rgba(197,179,216,0.52) 52%, rgba(244,234,216,0.45) 72%, transparent 100%)",
                      }}
                      initial={{ left: "-48%", opacity: 0 }}
                      animate={{ left: "112%", opacity: [0, sweep, 0] }}
                      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </div>

        {captions && active ? (
          <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 pb-2 text-center">
            {active.title ? (
              <h3
                className="font-display text-2xl font-light tracking-[-0.02em] sm:text-3xl"
                style={{ color: titleColor }}
              >
                {active.title}
              </h3>
            ) : null}
            {active.subtitle ? (
              <p
                className="mt-1 font-serif text-sm italic sm:text-base"
                style={{ color: subtitleColor }}
              >
                {active.subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        {controls ? (
          <div className="relative z-10 mt-3 grid grid-cols-[2.5rem_minmax(4.5rem,auto)_2.5rem] items-center justify-center gap-x-4 pb-1">
            <button
              type="button"
              onClick={previous}
              disabled={!loop && index === 0}
              aria-label="Previous look"
              className="inline-flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-cream/90 transition disabled:opacity-40"
              style={{
                color: titleColor,
                border: `1px solid ${accentColor}`,
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <p
              className="text-center font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] pl-[0.28em]"
              style={{ color: accentColor }}
            >
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={next}
              disabled={!loop && index === count - 1}
              aria-label="Next look"
              className="inline-flex h-10 w-10 items-center justify-center justify-self-center rounded-full bg-cream/90 transition disabled:opacity-40"
              style={{
                color: titleColor,
                border: `1px solid ${accentColor}`,
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);
