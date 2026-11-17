"use client";

import { cn } from "@/lib/utils";
import {
  useMotionValue,
  animate,
  motion,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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

/** Ignore tiny pointer jitter so desktop clicks still open photos. */
const DRAG_THRESHOLD_PX = 10;

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
  const [containerRef, containerBounds] = useMeasure();
  const [setRef, setBounds] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pointerActiveRef = useRef(false);
  const dragMovedRef = useRef(false);
  const startPointerRef = useRef(0);
  const lastPointerRef = useRef(0);
  const loopSizeRef = useRef(0);

  const isHorizontal = direction === "horizontal";
  const containerSize = isHorizontal ? containerBounds.width : containerBounds.height;
  const setSize = isHorizontal ? setBounds.width : setBounds.height;

  // Repeat the set until the track is always ≥ 2× viewport — no visible end/gap.
  const copies = useMemo(() => {
    if (!containerSize || !setSize) return 4;
    const unit = setSize + gap;
    const needed = Math.ceil((containerSize * 2) / Math.max(1, unit));
    // Keep an even count so looping by one set stays seamless.
    return Math.max(4, needed % 2 === 0 ? needed : needed + 1);
  }, [containerSize, setSize, gap]);

  useEffect(() => {
    setCurrentDuration(duration);
  }, [duration]);

  useEffect(() => {
    if (setSize) loopSizeRef.current = setSize + gap;
  }, [setSize, gap]);

  useEffect(() => {
    if (isDragging) return;

    let controls: AnimationPlaybackControls | undefined;
    const loop = setSize + gap;
    if (!setSize || !loop) return;

    const from = reverse ? -loop : 0;
    const to = reverse ? 0 : -loop;

    if (isTransitioning) {
      const current = translation.get();
      controls = animate(translation, [current, to], {
        ease: "linear",
        duration:
          currentDuration * Math.abs((current - to) / Math.max(1, loop)),
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
    setSize,
    gap,
    isTransitioning,
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
    if (!pointerActiveRef.current) return;
    const didDrag = dragMovedRef.current;
    pointerActiveRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (didDrag) {
      setIsDragging(false);
      setIsTransitioning(true);
      setKey((prev) => prev + 1);
    }
  };

  const childSets = useMemo(
    () => Array.from({ length: copies }, (_, index) => index),
    [copies],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        draggable && "cursor-grab touch-pan-y active:cursor-grabbing select-none",
        className,
      )}
      style={
        draggable
          ? { touchAction: isHorizontal ? "pan-y" : "pan-x" }
          : undefined
      }
      onPointerDown={(event) => {
        if (!draggable || event.button !== 0) return;
        pointerActiveRef.current = true;
        dragMovedRef.current = false;
        const point = isHorizontal ? event.clientX : event.clientY;
        startPointerRef.current = point;
        lastPointerRef.current = point;
      }}
      onPointerMove={(event) => {
        if (!pointerActiveRef.current) return;
        const point = isHorizontal ? event.clientX : event.clientY;
        const total = Math.abs(point - startPointerRef.current);

        if (!dragMovedRef.current) {
          if (total < DRAG_THRESHOLD_PX) return;
          dragMovedRef.current = true;
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          lastPointerRef.current = point;
          return;
        }

        const delta = point - lastPointerRef.current;
        lastPointerRef.current = point;
        const next = wrapLoop(translation.get() + delta, loopSizeRef.current);
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
          ...(isHorizontal ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
          flexDirection: isHorizontal ? "row" : "column",
        }}
        {...hoverProps}
      >
        {childSets.map((copyIndex) => (
          <div
            key={`copy-${copyIndex}`}
            ref={copyIndex === 0 ? setRef : undefined}
            className="flex"
            style={{
              gap: `${gap}px`,
              flexDirection: isHorizontal ? "row" : "column",
            }}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
