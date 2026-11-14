"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type PageFlipLeaf = {
  id?: string;
  front: React.ReactNode;
  back: React.ReactNode;
  alt?: string;
};

type EaseName = "easeInOut" | "easeOut" | "circOut" | "backOut";

export type PageFlipProps = {
  pages: PageFlipLeaf[];
  pageWidth?: number;
  pageHeight?: number;
  pageRadius?: number;
  pageColor?: string;
  perspective?: number;
  /** Kept for React Bits API parity; spread is centered by default. */
  spineShift?: number;
  turnAngle?: number;
  peekAngle?: number;
  duration?: number;
  stagger?: number;
  ease?: EaseName;
  shadow?: number;
  trigger?: "click" | "hover";
  closeOnLeave?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onTurnedChange?: (turnedCount: number) => void;
};

const EASE_CSS: Record<EaseName, string> = {
  easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
  easeOut: "cubic-bezier(0, 0, 0.58, 1)",
  circOut: "cubic-bezier(0, 0.55, 0.45, 1)",
  backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

const DRAG_SLOP = 6;
const AXIS_LOCK_SLOP = 10; // decide horizontal page-turn vs vertical page-scroll
const FLICK_VELOCITY = 0.55; // px/ms — commit a turn on a quick flick
const COMMIT_RATIO = 0.42;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PageFlip({
  pages,
  pageWidth = 220,
  pageHeight = 320,
  pageRadius = 4,
  pageColor = "#f4f4f4",
  perspective = 1200,
  spineShift = 110,
  turnAngle = 180,
  peekAngle = 10,
  duration = 0.55,
  stagger = 0.08,
  ease = "easeInOut",
  shadow = 0.3,
  trigger = "click",
  closeOnLeave = true,
  interactive = true,
  className,
  style,
  onTurnedChange,
}: PageFlipProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [turned, setTurned] = React.useState(0);
  const [peeking, setPeeking] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [dragAngle, setDragAngle] = React.useState(0);
  const [dragTilt, setDragTilt] = React.useState(0);
  const [closing, setClosing] = React.useState(false);

  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    leafIndex: number;
    mode: "forward" | "back";
    moved: boolean;
    /** null until gesture axis is known — vertical cancels so the page can scroll. */
    axis: "horizontal" | "vertical" | null;
    captured: boolean;
    angle: number;
    tilt: number;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);

  const leafCount = pages.length;
  const turnMs = reducedMotion ? 0 : duration * 1000;
  const easeCss = EASE_CSS[ease];

  const setTurnedSafe = React.useCallback(
    (next: number | ((prev: number) => number)) => {
      setTurned((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        return Math.max(0, Math.min(leafCount, value));
      });
    },
    [leafCount],
  );

  React.useEffect(() => {
    onTurnedChange?.(turned);
  }, [turned, onTurnedChange]);

  const turnForward = React.useCallback(() => {
    setClosing(false);
    setTurnedSafe((n) => Math.min(leafCount, n + 1));
  }, [leafCount, setTurnedSafe]);

  const turnBack = React.useCallback(() => {
    setClosing(false);
    setTurnedSafe((n) => Math.max(0, n - 1));
  }, [setTurnedSafe]);

  const closeAll = React.useCallback(() => {
    if (turned === 0) return;
    setClosing(true);
    setTurnedSafe(0);
    window.setTimeout(
      () => setClosing(false),
      turnMs + stagger * leafCount * 1000 + 40,
    );
  }, [turned, setTurnedSafe, turnMs, stagger, leafCount]);

  const clearDragUi = React.useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setDragAngle(0);
    setDragTilt(0);
  }, []);

  const applyDragFromPointer = React.useCallback(
    (clientX: number, clientY: number, target: HTMLDivElement) => {
      const drag = dragRef.current;
      if (!drag || drag.axis === "vertical") return;

      const now = performance.now();
      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Wait for a clear axis before capturing — vertical swipes must scroll the invite.
      if (drag.axis === null) {
        if (absDx < AXIS_LOCK_SLOP && absDy < AXIS_LOCK_SLOP) return;
        if (absDy > absDx) {
          drag.axis = "vertical";
          clearDragUi();
          return;
        }
        drag.axis = "horizontal";
        if (!drag.captured) {
          try {
            target.setPointerCapture(drag.pointerId);
            drag.captured = true;
          } catch {
            /* pointer already gone */
          }
          setDragging(true);
          setPeeking(false);
        }
      }

      const dt = Math.max(1, now - drag.lastT);
      const instantVelocity = (clientX - drag.lastX) / dt;

      drag.lastX = clientX;
      drag.lastT = now;
      // EMA so a flick still reads after a short pause at the end.
      drag.velocity = drag.velocity * 0.65 + instantVelocity * 0.35;

      if (absDx > DRAG_SLOP || absDy > DRAG_SLOP) {
        drag.moved = true;
      }

      // Real book: pull the right page left to turn forward; pull the left page right to go back.
      const travel = pageWidth * 0.92;
      let angle = drag.mode === "forward" ? 0 : -turnAngle;
      if (drag.mode === "forward") {
        const t = clamp(-dx / travel, 0, 1);
        angle = -t * turnAngle;
      } else {
        const t = clamp(dx / travel, 0, 1);
        angle = -turnAngle + t * turnAngle;
      }

      // Soft vertical tilt while dragging — pages feel held in the hand.
      const tilt = clamp((-dy / pageHeight) * 7, -7, 7);

      drag.angle = angle;
      drag.tilt = tilt;
      setDragAngle(angle);
      setDragTilt(tilt);
    },
    [clearDragUi, pageHeight, pageWidth, turnAngle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0 || leafCount === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    // Closed / fully ended books are visually centered; map presses to the only valid turn.
    const mode: "forward" | "back" =
      turned === 0
        ? "forward"
        : turned >= leafCount
          ? "back"
          : x >= pageWidth
            ? "forward"
            : "back";

    if (mode === "forward" && turned >= leafCount) return;
    if (mode === "back" && turned <= 0) return;

    const leafIndex = mode === "forward" ? turned : turned - 1;
    const angle = mode === "forward" ? 0 : -turnAngle;
    // Defer capture until the gesture locks horizontal — otherwise touch scrolls are blocked.
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      leafIndex,
      mode,
      moved: false,
      axis: null,
      captured: false,
      angle,
      tilt: 0,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
    setDragAngle(angle);
    setDragTilt(0);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    applyDragFromPointer(event.clientX, event.clientY, event.currentTarget);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.captured) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    }

    // Vertical gesture was handed to the browser for page scrolling.
    if (drag.axis === "vertical") {
      clearDragUi();
      return;
    }

    const angle = drag.angle;
    const velocity = drag.velocity;
    const progress = Math.abs(angle) / Math.max(1, turnAngle);

    const flickedForward = drag.mode === "forward" && velocity <= -FLICK_VELOCITY;
    const flickedBack = drag.mode === "back" && velocity >= FLICK_VELOCITY;
    const draggedForward = drag.mode === "forward" && progress >= COMMIT_RATIO;
    const draggedBack = drag.mode === "back" && progress <= 1 - COMMIT_RATIO;

    if (!drag.moved && trigger === "click") {
      if (drag.mode === "forward") turnForward();
      else turnBack();
    } else if (drag.axis === "horizontal" && (flickedForward || draggedForward)) {
      turnForward();
    } else if (drag.axis === "horizontal" && (flickedBack || draggedBack)) {
      turnBack();
    }
    // else: settle back — CSS transition restores the leaf once dragging ends

    clearDragUi();
  };

  const onPointerEnter = () => {
    if (!interactive || dragging) return;
    setPeeking(true);
  };

  const onPointerLeave = () => {
    setPeeking(false);
    if (closeOnLeave && interactive && !dragging) {
      closeAll();
    }
  };

  React.useEffect(() => {
    if (trigger !== "hover" || !interactive || !peeking || dragging) return;
    if (turned >= leafCount) return;
    const id = window.setTimeout(() => turnForward(), Math.max(180, turnMs * 0.35));
    return () => window.clearTimeout(id);
  }, [trigger, interactive, peeking, dragging, turned, leafCount, turnForward, turnMs]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      turnForward();
    } else if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") {
      event.preventDefault();
      turnBack();
    } else if (event.key === "Home") {
      event.preventDefault();
      closeAll();
    } else if (event.key === "End") {
      event.preventDefault();
      setTurnedSafe(leafCount);
    }
  };

  // Closed cover and final end page sit centered; open spreads keep the spine centered.
  const ended = leafCount > 0 && turned >= leafCount;
  const turnProgress = Math.min(1, Math.abs(dragAngle) / Math.max(1, turnAngle));
  let shift = 0;
  if (turned === 0) shift = -pageWidth / 2;
  else if (ended) shift = pageWidth / 2;
  else if (spineShift > 0) shift = (turned / leafCount) * spineShift;

  if (dragging && dragRef.current) {
    if (turned === 0 && dragRef.current.mode === "forward") {
      shift = (-pageWidth / 2) * (1 - turnProgress);
    } else if (ended && dragRef.current.mode === "back") {
      shift = (pageWidth / 2) * turnProgress;
    } else if (!ended && turned === leafCount - 1 && dragRef.current.mode === "forward") {
      shift = (pageWidth / 2) * turnProgress;
    } else if (turned === 1 && dragRef.current.mode === "back") {
      shift = (-pageWidth / 2) * (1 - turnProgress);
    }
  }

  // Mid-flip shade peaks near 90° for a paper curl feel.
  const midFlip = Math.sin(turnProgress * Math.PI);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="book"
      aria-label="Story book"
      aria-valuemin={0}
      aria-valuemax={leafCount}
      aria-valuenow={turned}
      tabIndex={interactive ? 0 : -1}
      className={cn(
        "page-flip relative outline-none select-none",
        interactive && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        width: pageWidth * 2,
        height: pageHeight,
        perspective: `${perspective}px`,
        // Allow vertical page scroll over the book; horizontal still turns pages.
        touchAction: "pan-y",
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <div
        className="page-flip-stage relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateX(${shift}px)`,
          transition: dragging || reducedMotion ? "none" : `transform ${duration}s ${easeCss}`,
        }}
      >
        {/* Soft spine cue at the center fold (only once opened) */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 z-0 h-full w-[3px]"
          style={{
            left: pageWidth - 1,
            background:
              "linear-gradient(180deg, rgba(90,58,26,0.15), rgba(201,137,31,0.45), rgba(90,58,26,0.15))",
            boxShadow: "0 0 12px rgba(244,196,68,0.15)",
            opacity: turned === 0 || ended ? 0 : 0.7,
            transition: `opacity ${duration}s ${easeCss}`,
          }}
        />

        {/* Ground shadow cast by the flipping leaf */}
        {dragging ? (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-6%] z-[1]"
            style={{
              left: pageWidth * (0.15 + turnProgress * 0.2),
              width: pageWidth * (0.7 - midFlip * 0.25),
              height: "14%",
              borderRadius: "50%",
              background: `radial-gradient(ellipse at center, rgba(0,0,0,${0.22 + midFlip * 0.2}) 0%, transparent 70%)`,
              filter: "blur(6px)",
              opacity: 0.85,
              transform: `translateX(${(0.5 - turnProgress) * pageWidth * 0.35}px)`,
            }}
          />
        ) : null}

        {pages.map((leaf, index) => {
          const isTurned = index < turned;
          const isActiveDrag = dragging && dragRef.current?.leafIndex === index;
          const isTopUnturned = index === turned && turned < leafCount;
          const showPeek = peeking && isTopUnturned && !dragging;

          let rotate = 0;
          let tilt = 0;
          let lift = 0;
          if (isActiveDrag) {
            rotate = dragAngle;
            tilt = dragTilt;
            lift = 12 + midFlip * 18;
          } else if (isTurned) {
            rotate = -turnAngle;
          } else if (showPeek) {
            rotate = -peekAngle;
            lift = 4;
          }

          const z = isTurned ? index + 1 : leafCount - index + 1;
          const delay =
            closing && !reducedMotion ? `${(leafCount - 1 - index) * stagger}s` : "0s";

          const shadowAlpha = Math.min(0.55, shadow);
          const foldShade = Math.abs(rotate) / Math.max(1, turnAngle);
          const curl = isActiveDrag ? midFlip : Math.sin(foldShade * Math.PI) * (showPeek ? 0.35 : 0);

          return (
            <div
              key={leaf.id ?? index}
              className="page-flip-leaf absolute top-0"
              aria-hidden={leaf.alt ? undefined : true}
              aria-label={leaf.alt}
              style={{
                left: pageWidth,
                width: pageWidth,
                height: pageHeight,
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                transform: `translateZ(${lift}px) rotateY(${rotate}deg) rotateX(${tilt}deg)`,
                zIndex: isActiveDrag ? leafCount + 5 : z,
                transition:
                  isActiveDrag || reducedMotion
                    ? "none"
                    : `transform ${duration}s ${easeCss} ${delay}`,
                borderRadius: pageRadius,
                willChange: isActiveDrag ? "transform" : undefined,
              }}
            >
              <div
                className="page-flip-face page-flip-front absolute inset-0 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  borderRadius: pageRadius,
                  backgroundColor: pageColor,
                  boxShadow:
                    shadow > 0
                      ? `0 ${14 + curl * 10}px ${28 + curl * 16}px rgba(0,0,0,${shadowAlpha * (0.45 + curl * 0.35)}), 0 2px 8px rgba(0,0,0,${shadowAlpha * 0.35})`
                      : undefined,
                }}
              >
                {leaf.front}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-8"
                  style={{
                    background: `linear-gradient(90deg, rgba(0,0,0,${0.16 + foldShade * 0.14 + curl * 0.18}), transparent)`,
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent 40%, rgba(0,0,0,${curl * 0.22}) 78%, rgba(255,255,255,${curl * 0.08}) 100%)`,
                    opacity: isActiveDrag || showPeek ? 1 : 0,
                  }}
                />
              </div>
              <div
                className="page-flip-face page-flip-back absolute inset-0 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderRadius: pageRadius,
                  backgroundColor: pageColor,
                  boxShadow:
                    shadow > 0
                      ? `0 ${14 + curl * 10}px ${28 + curl * 16}px rgba(0,0,0,${shadowAlpha * (0.4 + curl * 0.3)})`
                      : undefined,
                }}
              >
                {leaf.back}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 w-8"
                  style={{
                    background: `linear-gradient(270deg, rgba(0,0,0,${0.14 + foldShade * 0.12 + curl * 0.16}), transparent)`,
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `linear-gradient(270deg, transparent 40%, rgba(0,0,0,${curl * 0.2}) 78%, rgba(255,255,255,${curl * 0.06}) 100%)`,
                    opacity: isActiveDrag ? 1 : 0,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
