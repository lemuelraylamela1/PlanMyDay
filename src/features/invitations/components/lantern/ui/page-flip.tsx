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
  /** `drag` = swipe/drag only (no tap-to-turn). `click` also turns on tap. */
  trigger?: "click" | "hover" | "drag";
  /**
   * Phone path: one rotating leaf with dual faces (no multi-leaf stack).
   * Desktop keeps the multi-leaf stack.
   */
  flat?: boolean;
  closeOnLeave?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onTurnedChange?: (turnedCount: number) => void;
  /**
   * Flat hit target over the settled left page.
   * Left pages are back faces (`rotateY(180deg)`), which do not receive
   * pointer events reliably, so vertical reading has to live outside the 3D stage.
   */
  leftGesture?: React.ReactNode;
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

function spreadShift(turned: number, leafCount: number, pageWidth: number, spineShift: number) {
  if (leafCount <= 0 || turned <= 0) return -pageWidth / 2;
  if (turned >= leafCount) return pageWidth / 2;
  if (spineShift > 0) return (turned / leafCount) * spineShift;
  return 0;
}

function dragShift(
  turned: number,
  leafCount: number,
  pageWidth: number,
  spineShift: number,
  mode: "forward" | "back",
  progress: number,
) {
  const ended = leafCount > 0 && turned >= leafCount;
  if (turned === 0 && mode === "forward") return (-pageWidth / 2) * (1 - progress);
  if (ended && mode === "back") return (pageWidth / 2) * progress;
  if (!ended && turned === leafCount - 1 && mode === "forward") return (pageWidth / 2) * progress;
  if (turned === 1 && mode === "back") return (-pageWidth / 2) * (1 - progress);
  return spreadShift(turned, leafCount, pageWidth, spineShift);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

export function PageFlip(props: PageFlipProps) {
  if (props.flat) return <FlatPageFlip {...props} />;
  return <StackPageFlip {...props} />;
}

function StackPageFlip({
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
  leftGesture,
}: PageFlipProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const leafRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const frontFaceRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const backFaceRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [turned, setTurned] = React.useState(0);
  const [peeking, setPeeking] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  /** Leaf mid CSS settle — keep both faces for the flip, then hard-cull. */
  const [animatingLeaf, setAnimatingLeaf] = React.useState<number | null>(null);
  const [animatingMode, setAnimatingMode] = React.useState<"forward" | "back" | null>(null);
  const turnedRef = React.useRef(0);
  const prevTurnedRef = React.useRef(0);
  turnedRef.current = turned;

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

  React.useEffect(() => {
    if (dragging) {
      prevTurnedRef.current = turned;
      return;
    }
    if (prevTurnedRef.current === turned) return;
    const forward = turned > prevTurnedRef.current;
    const leaf = forward ? turned - 1 : prevTurnedRef.current - 1;
    prevTurnedRef.current = turned;
    if (leaf < 0 || leaf >= leafCount) {
      setAnimatingLeaf(null);
      setAnimatingMode(null);
      return;
    }
    setAnimatingLeaf(leaf);
    setAnimatingMode(forward ? "forward" : "back");
  }, [turned, dragging, leafCount]);

  // transitionend can miss (tab blur / reduced motion) — always clear the settle flag.
  React.useEffect(() => {
    if (animatingLeaf == null) return;
    const id = window.setTimeout(() => {
      setAnimatingLeaf(null);
      setAnimatingMode(null);
    }, turnMs + 120);
    return () => window.clearTimeout(id);
  }, [animatingLeaf, turnMs]);

  const paintFaceCull = React.useCallback((leafIndex: number, angle: number) => {
    const front = frontFaceRefs.current[leafIndex];
    const back = backFaceRefs.current[leafIndex];
    // Hard-hide the away face — backface-visibility alone fails with lift/tilt.
    const showFront = angle > -90;
    if (front) {
      front.style.visibility = showFront ? "visible" : "hidden";
      front.style.pointerEvents = showFront ? "auto" : "none";
    }
    if (back) {
      back.style.visibility = showFront ? "hidden" : "visible";
      back.style.pointerEvents = showFront ? "none" : "auto";
    }
  }, []);

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
  }, []);

  const paintDrag = React.useCallback(
    (angle: number, tilt: number, leafIndex: number, mode: "forward" | "back") => {
      const leaf = leafRefs.current[leafIndex];
      const progress = Math.min(1, Math.abs(angle) / Math.max(1, turnAngle));
      const midFlip = Math.sin(progress * Math.PI);
      const lift = 12 + midFlip * 18;
      if (leaf) {
        leaf.style.transition = "none";
        leaf.style.transform = `translateZ(${lift}px) rotateY(${angle}deg) rotateX(${tilt}deg)`;
        leaf.style.zIndex = String(leafCount + 5);
      }
      paintFaceCull(leafIndex, angle);

      const current = turnedRef.current;
      const endedNow = leafCount > 0 && current >= leafCount;
      let shift = 0;
      if (current === 0) shift = -pageWidth / 2;
      else if (endedNow) shift = pageWidth / 2;
      else if (spineShift > 0) shift = (current / leafCount) * spineShift;

      if (current === 0 && mode === "forward") {
        shift = (-pageWidth / 2) * (1 - progress);
      } else if (endedNow && mode === "back") {
        shift = (pageWidth / 2) * progress;
      } else if (!endedNow && current === leafCount - 1 && mode === "forward") {
        shift = (pageWidth / 2) * progress;
      } else if (current === 1 && mode === "back") {
        shift = (-pageWidth / 2) * (1 - progress);
      }

      const stage = stageRef.current;
      if (stage) {
        stage.style.transition = "none";
        stage.style.transform = `translateX(${shift}px)`;
      }
    },
    [leafCount, pageWidth, paintFaceCull, spineShift, turnAngle],
  );

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
      paintDrag(angle, tilt, drag.leafIndex, drag.mode);
    },
    [clearDragUi, pageHeight, pageWidth, paintDrag, turnAngle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0 || leafCount === 0) return;
    // One swipe, one page — a leaf already turning must finish first.
    if (animatingLeaf != null || dragRef.current) return;
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
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    applyDragFromPointer(event.clientX, event.clientY, event.currentTarget);
  };

  const endDrag = (pointerId: number) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;

    if (drag.captured && rootRef.current) {
      try {
        rootRef.current.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
    }

    const tapTurn = !drag.moved && trigger === "click";
    // Vertical or undecided gestures belong to the page scroll, not the book.
    if (drag.axis !== "horizontal" && !tapTurn) {
      clearDragUi();
      return;
    }

    const velocity = drag.velocity;
    const progress = Math.abs(drag.angle) / Math.max(1, turnAngle);
    const leafIndex = drag.leafIndex;

    const flickedForward = drag.mode === "forward" && velocity <= -FLICK_VELOCITY;
    const flickedBack = drag.mode === "back" && velocity >= FLICK_VELOCITY;
    const draggedForward = drag.mode === "forward" && progress >= COMMIT_RATIO;
    const draggedBack = drag.mode === "back" && progress <= 1 - COMMIT_RATIO;

    let committed = false;
    if (tapTurn) {
      if (drag.mode === "forward") turnForward();
      else turnBack();
      committed = true;
    } else if (flickedForward || draggedForward) {
      turnForward();
      committed = true;
    } else if (flickedBack || draggedBack) {
      turnBack();
      committed = true;
    }

    // React skips a style write when the virtual transform string did not change,
    // which left the imperative drag angle stuck in the gutter. Always paint the rest pose.
    const settledAngle = committed
      ? drag.mode === "forward"
        ? -turnAngle
        : 0
      : drag.mode === "forward"
        ? 0
        : -turnAngle;
    const nextTurned = committed
      ? drag.mode === "forward"
        ? Math.min(leafCount, turnedRef.current + 1)
        : Math.max(0, turnedRef.current - 1)
      : turnedRef.current;
    const leaf = leafRefs.current[leafIndex];
    if (leaf) {
      leaf.style.transition = reducedMotion ? "none" : `transform ${duration}s ${easeCss}`;
      leaf.style.transform = `translateZ(0px) rotateY(${settledAngle}deg) rotateX(0deg)`;
    }
    paintFaceCull(leafIndex, settledAngle);
    const stage = stageRef.current;
    if (stage) {
      stage.style.transition = reducedMotion ? "none" : `transform ${duration}s ${easeCss}`;
      stage.style.transform = `translateX(${spreadShift(nextTurned, leafCount, pageWidth, spineShift)}px)`;
    }

    setAnimatingLeaf(leafIndex);
    setAnimatingMode(drag.mode);
    clearDragUi();
  };

  const endDragRef = React.useRef(endDrag);
  endDragRef.current = endDrag;

  React.useEffect(() => {
    const onUp = (event: PointerEvent) => endDragRef.current(event.pointerId);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    endDrag(event.pointerId);
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
  const liveDrag = dragging ? dragRef.current : null;
  const dragAngle = liveDrag?.angle ?? 0;
  const dragTilt = liveDrag?.tilt ?? 0;
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

  const visibleLeaves = new Set<number>();
  if (turned > 0) visibleLeaves.add(turned - 1);
  if (turned < leafCount) visibleLeaves.add(turned);
  const liveLeaf = dragging ? dragRef.current : null;
  if (liveLeaf) {
    visibleLeaves.add(liveLeaf.leafIndex);
    if (liveLeaf.mode === "forward" && liveLeaf.leafIndex + 1 < leafCount) {
      visibleLeaves.add(liveLeaf.leafIndex + 1);
    }
    if (liveLeaf.mode === "back" && liveLeaf.leafIndex - 1 >= 0) {
      visibleLeaves.add(liveLeaf.leafIndex - 1);
    }
  }
  if (animatingLeaf != null) {
    visibleLeaves.add(animatingLeaf);
    if (animatingMode === "forward" && animatingLeaf + 1 < leafCount) {
      visibleLeaves.add(animatingLeaf + 1);
    }
    if (animatingMode === "back" && animatingLeaf - 1 >= 0) {
      visibleLeaves.add(animatingLeaf - 1);
    }
  }

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
        "page-flip relative isolate outline-none select-none",
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
        ref={stageRef}
        className="page-flip-stage relative z-0 h-full w-full"
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
          if (!visibleLeaves.has(index)) return null;
          const isTurned = index < turned;
          const isActiveDrag = dragging && dragRef.current?.leafIndex === index;
          const isTopUnturned = index === turned && turned < leafCount;
          const showPeek = peeking && isTopUnturned && !dragging;
          const isAnimating = animatingLeaf === index;

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

          // Cull the away face when settled. Mid-drag uses paintFaceCull (imperative);
          // mid-CSS settle keeps both faces so the flip can complete without popping.
          const settledCull = !isActiveDrag && !isAnimating;
          const hideFront = settledCull && isTurned;
          const hideBack = settledCull && !isTurned;
          // During drag, leave visibility unset so paintFaceCull owns it.
          const frontVisibility = isActiveDrag
            ? undefined
            : hideFront
              ? "hidden"
              : "visible";
          const backVisibility = isActiveDrag
            ? undefined
            : hideBack
              ? "hidden"
              : "visible";

          return (
            <div
              key={leaf.id ?? index}
              ref={(node) => {
                leafRefs.current[index] = node;
              }}
              className="page-flip-leaf absolute top-0"
              aria-hidden={leaf.alt ? undefined : true}
              aria-label={leaf.alt}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.propertyName !== "transform") return;
                if (animatingLeaf === index) {
                  setAnimatingLeaf(null);
                  setAnimatingMode(null);
                }
              }}
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
                ref={(node) => {
                  frontFaceRefs.current[index] = node;
                }}
                className="page-flip-face page-flip-front absolute inset-0 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  // Tiny thickness + flat contents stops coplanar cover/photo bleed.
                  transformStyle: "flat",
                  transform: "translateZ(1px)",
                  clipPath: "inset(0)",
                  WebkitClipPath: "inset(0)",
                  visibility: frontVisibility,
                  pointerEvents: hideFront ? "none" : "auto",
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
                ref={(node) => {
                  backFaceRefs.current[index] = node;
                }}
                className="page-flip-face page-flip-back absolute inset-0 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transformStyle: "flat",
                  transform: "rotateY(180deg) translateZ(1px)",
                  clipPath: "inset(0)",
                  WebkitClipPath: "inset(0)",
                  visibility: backVisibility,
                  pointerEvents: hideBack ? "none" : "auto",
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
      {leftGesture ? (
        <div
          className="absolute top-0 z-30 h-full"
          style={{ left: 0, width: pageWidth }}
        >
          {leftGesture}
        </div>
      ) : null}
    </div>
  );
}

function FlatPageFlip({
  pages,
  pageWidth = 220,
  pageHeight = 320,
  pageRadius = 4,
  pageColor = "#f4f4f4",
  perspective = 1200,
  spineShift = 110,
  turnAngle = 180,
  duration = 0.55,
  shadow = 0.3,
  trigger = "click",
  interactive = true,
  className,
  style,
  onTurnedChange,
  leftGesture,
}: PageFlipProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [turned, setTurned] = React.useState(0);
  const turnedRef = React.useRef(0);
  turnedRef.current = turned;
  const leafCount = pages.length;
  const [flip, setFlip] = React.useState<{
    leafIndex: number;
    mode: "forward" | "back";
  } | null>(null);
  const [angle, setAngle] = React.useState(0);
  const glidingRef = React.useRef(false);
  const glideFrame = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    leafIndex: number;
    mode: "forward" | "back";
    moved: boolean;
    axis: "horizontal" | "vertical" | null;
    captured: boolean;
    angle: number;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);

  React.useEffect(() => {
    onTurnedChange?.(turned);
  }, [turned, onTurnedChange]);

  React.useEffect(
    () => () => {
      if (glideFrame.current != null) cancelAnimationFrame(glideFrame.current);
    },
    [],
  );

  const startGlide = React.useCallback(
    (from: number, to: number, mode: "forward" | "back", commit: boolean) => {
      if (glideFrame.current != null) cancelAnimationFrame(glideFrame.current);
      glidingRef.current = true;
      const t0 = performance.now();
      const ms = reducedMotion ? 0 : duration * 1000;
      const step = (now: number) => {
        const t = ms <= 0 ? 1 : Math.min(1, (now - t0) / ms);
        setAngle(from + (to - from) * easeInOut(t));
        if (t < 1) {
          glideFrame.current = requestAnimationFrame(step);
          return;
        }
        glideFrame.current = null;
        if (commit) {
          const n = turnedRef.current;
          const next = mode === "forward" ? Math.min(leafCount, n + 1) : Math.max(0, n - 1);
          // Update the ref now, not on the next render: a tap landing between this
          // frame and React's re-render would otherwise read the old page and
          // re-flip the leaf that just turned.
          turnedRef.current = next;
          setTurned(next);
        }
        glidingRef.current = false;
        setFlip(null);
      };
      glideFrame.current = requestAnimationFrame(step);
    },
    [duration, leafCount, reducedMotion],
  );

  const beginFlip = React.useCallback(
    (mode: "forward" | "back") => {
      if (glidingRef.current || dragRef.current) return;
      const current = turnedRef.current;
      if (mode === "forward" && current >= leafCount) return;
      if (mode === "back" && current <= 0) return;
      const leafIndex = mode === "forward" ? current : current - 1;
      const from = mode === "forward" ? 0 : -turnAngle;
      setFlip({ leafIndex, mode });
      setAngle(from);
      startGlide(from, mode === "forward" ? -turnAngle : 0, mode, true);
    },
    [leafCount, startGlide, turnAngle],
  );

  const endDrag = React.useCallback(
    (pointerId: number) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== pointerId) return;
      dragRef.current = null;
      if (drag.captured && rootRef.current) {
        try {
          rootRef.current.releasePointerCapture(pointerId);
        } catch {
          /* already released */
        }
      }
      const tapTurn = !drag.moved && trigger === "click";
      if (drag.axis !== "horizontal" && !tapTurn) {
        setFlip(null);
        return;
      }
      const progress = Math.abs(drag.angle) / Math.max(1, turnAngle);
      const commit =
        drag.mode === "forward"
          ? tapTurn || drag.velocity <= -FLICK_VELOCITY || progress >= COMMIT_RATIO
          : tapTurn || drag.velocity >= FLICK_VELOCITY || progress <= 1 - COMMIT_RATIO;
      const to = commit
        ? drag.mode === "forward"
          ? -turnAngle
          : 0
        : drag.mode === "forward"
          ? 0
          : -turnAngle;
      setFlip({ leafIndex: drag.leafIndex, mode: drag.mode });
      // Reset the angle in the same render as the new flip. Without this the leaf
      // rendered for one frame at the PREVIOUS flip's final angle (-180°) — the
      // new page flashed fully turned, then snapped back (the double-tap glitch).
      setAngle(drag.angle);
      startGlide(drag.angle, to, drag.mode, commit);
    },
    [startGlide, trigger, turnAngle],
  );

  const endDragRef = React.useRef(endDrag);
  endDragRef.current = endDrag;

  React.useEffect(() => {
    const onUp = (event: PointerEvent) => endDragRef.current(event.pointerId);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0 || leafCount === 0) return;
    if (glidingRef.current || dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    // Ref, not render state — always the latest page even right after a flip ends.
    const turned = turnedRef.current;
    const mode: "forward" | "back" =
      turned === 0 ? "forward" : turned >= leafCount ? "back" : x >= pageWidth ? "forward" : "back";
    if (mode === "forward" && turned >= leafCount) return;
    if (mode === "back" && turned <= 0) return;
    const leafIndex = mode === "forward" ? turned : turned - 1;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      leafIndex,
      mode,
      moved: false,
      axis: null,
      captured: false,
      angle: mode === "forward" ? 0 : -turnAngle,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || glidingRef.current) return;
    const now = performance.now();
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.axis === null) {
      if (Math.abs(dx) < AXIS_LOCK_SLOP && Math.abs(dy) < AXIS_LOCK_SLOP) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.axis = "vertical";
        dragRef.current = null;
        return;
      }
      drag.axis = "horizontal";
      setFlip({ leafIndex: drag.leafIndex, mode: drag.mode });
      try {
        event.currentTarget.setPointerCapture(drag.pointerId);
        drag.captured = true;
      } catch {
        /* pointer already gone */
      }
    }
    if (drag.axis !== "horizontal") return;
    const dt = Math.max(1, now - drag.lastT);
    drag.velocity = drag.velocity * 0.65 + ((event.clientX - drag.lastX) / dt) * 0.35;
    drag.lastX = event.clientX;
    drag.lastT = now;
    if (Math.abs(dx) > DRAG_SLOP || Math.abs(dy) > DRAG_SLOP) drag.moved = true;

    // No rotateX tilt on the flat/mobile path — tilt opens wedge gaps that
    // let the under/static page ghost through the turning leaf.
    const travel = pageWidth * 0.92;
    let next = drag.mode === "forward" ? 0 : -turnAngle;
    if (drag.mode === "forward") next = -clamp(-dx / travel, 0, 1) * turnAngle;
    else next = -turnAngle + clamp(dx / travel, 0, 1) * turnAngle;
    drag.angle = next;
    setAngle(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      beginFlip("forward");
    } else if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") {
      event.preventDefault();
      beginFlip("back");
    } else     if (event.key === "Home") {
      event.preventDefault();
      if (glideFrame.current != null) cancelAnimationFrame(glideFrame.current);
      glidingRef.current = false;
      setFlip(null);
      setTurned(0);
    } else if (event.key === "End") {
      event.preventDefault();
      if (glideFrame.current != null) cancelAnimationFrame(glideFrame.current);
      glidingRef.current = false;
      setFlip(null);
      setTurned(leafCount);
    }
  };

  const progress = Math.min(1, Math.abs(angle) / Math.max(1, turnAngle));
  const showFront = angle > -90;
  const shift = flip
    ? dragShift(turned, leafCount, pageWidth, spineShift, flip.mode, progress)
    : spreadShift(turned, leafCount, pageWidth, spineShift);
  // Keep the resting page on the side that is not turning for the whole flip.
  // Hiding it at halfway left an empty half while the leaf was still edge-on.
  const showStaticLeft = turned > 0 && flip?.mode !== "back";
  const showStaticRight = turned < leafCount && flip?.mode !== "forward";
  const underRight =
    flip?.mode === "forward" && flip.leafIndex + 1 < leafCount ? pages[flip.leafIndex + 1]?.front : null;
  const underLeft =
    flip?.mode === "back" && flip.leafIndex > 0 ? pages[flip.leafIndex - 1]?.back : null;
  const flipLeaf = flip ? pages[flip.leafIndex] : null;
  const faceShadow =
    shadow > 0 ? `0 16px 28px rgba(0,0,0,${Math.min(0.45, shadow)})` : undefined;
  const slot = (side: "left" | "right"): React.CSSProperties => ({
    left: side === "left" ? 0 : pageWidth,
    width: pageWidth,
    height: pageHeight,
    borderRadius: pageRadius,
    backgroundColor: pageColor,
  });

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
        "page-flip relative isolate outline-none select-none",
        interactive && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        width: pageWidth * 2,
        height: pageHeight,
        perspective: `${perspective}px`,
        touchAction: "pan-y",
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => endDrag(event.pointerId)}
      onPointerCancel={(event) => endDrag(event.pointerId)}
      onKeyDown={onKeyDown}
    >
      {/* Flat under/static pages stay outside preserve-3d so mobile GPUs
          cannot drop them while the leaf rotates. */}
      <div
        className="relative h-full w-full"
        style={{ transform: `translateX(${shift}px)` }}
      >
        {underLeft ? (
          <div className="absolute top-0 z-[1] overflow-hidden" style={slot("left")}>
            {underLeft}
          </div>
        ) : null}
        {underRight ? (
          <div className="absolute top-0 z-[1] overflow-hidden" style={slot("right")}>
            {underRight}
          </div>
        ) : null}
        {showStaticLeft ? (
          <div className="absolute top-0 z-[2] overflow-hidden" style={slot("left")}>
            {pages[turned - 1]?.back}
          </div>
        ) : null}
        {showStaticRight ? (
          <div className="absolute top-0 z-[2] overflow-hidden" style={slot("right")}>
            {pages[turned]?.front}
          </div>
        ) : null}
        {flip && flipLeaf ? (
          <div
            className="absolute top-0 z-[5]"
            style={{
              left: pageWidth,
              width: pageWidth,
              height: pageHeight,
              perspective: `${perspective}px`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                transform: `rotateY(${angle}deg)`,
                borderRadius: pageRadius,
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transformStyle: "flat",
                  transform: "translateZ(1px)",
                  clipPath: "inset(0)",
                  WebkitClipPath: "inset(0)",
                  visibility: showFront ? "visible" : "hidden",
                  borderRadius: pageRadius,
                  backgroundColor: pageColor,
                  boxShadow: faceShadow,
                }}
              >
                {flipLeaf.front}
              </div>
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transformStyle: "flat",
                  transform: "rotateY(180deg) translateZ(1px)",
                  clipPath: "inset(0)",
                  WebkitClipPath: "inset(0)",
                  visibility: showFront ? "hidden" : "visible",
                  borderRadius: pageRadius,
                  backgroundColor: pageColor,
                  boxShadow: faceShadow,
                }}
              >
                {flipLeaf.back}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {leftGesture ? (
        <div className="absolute top-0 z-30 h-full" style={{ left: 0, width: pageWidth }}>
          {leftGesture}
        </div>
      ) : null}
    </div>
  );
}
