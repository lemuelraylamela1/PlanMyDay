"use client";

import { cn } from "@/lib/utils";
import {
  useMotionValue,
  animate,
  motion,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
  /** When true (default), the row can be scrubbed by pointer drag. */
  draggable?: boolean;
};

function wrapLoop(value: number, loop: number) {
  if (loop <= 0) return value;
  let next = value;
  while (next > 0) next -= loop;
  while (next < -loop) next += loop;
  return next;
}

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = "horizontal",
  reverse = false,
  className,
  draggable = true,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const lastPointerRef = useRef(0);
  const loopSizeRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDuration(duration);
  }, [duration]);

  useEffect(() => {
    const size = direction === "horizontal" ? width : height;
    if (size) loopSizeRef.current = (size + gap) / 2;
  }, [width, height, gap, direction]);

  useEffect(() => {
    if (isDragging) return;

    let controls: AnimationPlaybackControls | undefined;
    const size = direction === "horizontal" ? width : height;
    if (!size) return;

    const contentSize = size + gap;
    const loop = contentSize / 2;
    const from = reverse ? -loop : 0;
    const to = reverse ? 0 : -loop;

    if (isTransitioning) {
      const current = translation.get();
      controls = animate(translation, [current, to], {
        ease: "linear",
        duration: currentDuration * Math.abs((current - to) / loop),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      const current = wrapLoop(translation.get(), loop);
      translation.set(current);
      const distance = Math.abs(current - to) || loop;
      controls = animate(translation, [current, to], {
        ease: "linear",
        duration: currentDuration * (distance / loop),
        onComplete: () => {
          translation.set(from);
          setKey((prevKey) => prevKey + 1);
        },
      });
    }

    return () => controls?.stop();
  }, [
    key,
    translation,
    currentDuration,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
    isDragging,
  ]);

  const hoverProps =
    durationOnHover && !isDragging
      ? {
          onHoverStart: () => {
            setIsTransitioning(true);
            setCurrentDuration(durationOnHover);
          },
          onHoverEnd: () => {
            setIsTransitioning(true);
            setCurrentDuration(duration);
          },
        }
      : {};

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // Resume autoplay from the scrubbed position.
    setIsTransitioning(true);
    setKey((prev) => prev + 1);
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "overflow-hidden",
        draggable && "cursor-grab touch-pan-y active:cursor-grabbing select-none",
        className,
      )}
      style={draggable ? { touchAction: direction === "horizontal" ? "pan-y" : "pan-x" } : undefined}
      onPointerDown={(event) => {
        if (!draggable || event.button !== 0) return;
        draggingRef.current = true;
        dragMovedRef.current = false;
        lastPointerRef.current =
          direction === "horizontal" ? event.clientX : event.clientY;
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const point =
          direction === "horizontal" ? event.clientX : event.clientY;
        const delta = point - lastPointerRef.current;
        lastPointerRef.current = point;
        if (Math.abs(delta) > 0.5) dragMovedRef.current = true;

        const next = wrapLoop(
          translation.get() + delta,
          loopSizeRef.current,
        );
        translation.set(next);
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={(event) => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        dragMovedRef.current = false;
      }}
    >
      <motion.div
        className="flex w-max"
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
