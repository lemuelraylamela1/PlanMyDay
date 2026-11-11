"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getActiveLenis } from "../experience/lenis-bridge";

export type DollyGalleryImage = string | { src: string; alt?: string };
export type DollyCaptionLayout = "side" | "stack";

export type DollyGalleryProps = {
  images?: DollyGalleryImage[];
  /** Optional caption per image — same Z-plane as its photo. */
  captions?: React.ReactNode[];
  /** side = opposite X (desktop); stack = image above, caption below (mobile). */
  captionLayout?: DollyCaptionLayout;
  infinite?: boolean;
  itemWidth?: number;
  aspectRatio?: number;
  borderRadius?: number;
  grayscale?: number;
  perspective?: number;
  spacing?: number;
  spread?: number;
  scatter?: number;
  revealRange?: number;
  passRange?: number;
  parallaxX?: number;
  parallaxY?: number;
  parallaxSmooth?: number;
  tilt?: number;
  pulse?: number;
  drift?: number;
  smooth?: number;
  wheelSpeed?: number;
  dragSpeed?: number;
  autoScroll?: number;
  pauseOnHover?: boolean;
  backgroundColor?: string;
  upcomingBlur?: number;
  /**
   * When true, wheel input is captured globally (while this gallery is active),
   * so the dolly runs as long as the section owns the screen — not only when
   * the pointer is over an image.
   */
  interactive?: boolean;
  onIndexChange?: (index: number) => void;
  onProgress?: (progress: number) => void;
  className?: string;
  children?: React.ReactNode;
};

type NormalizedImage = { src: string; alt: string };

function normalizeImages(images: DollyGalleryImage[]): NormalizedImage[] {
  return images.map((img, i) =>
    typeof img === "string"
      ? { src: img, alt: `Gallery image ${i + 1}` }
      : { src: img.src, alt: img.alt ?? `Gallery image ${i + 1}` },
  );
}

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scatterSign(i: number) {
  const pattern = [1, -0.65, 0.4, -1, 0.55, -0.3];
  return pattern[i % pattern.length]!;
}

type LiveConfig = {
  infinite: boolean;
  spacing: number;
  spread: number;
  scatter: number;
  revealRange: number;
  passRange: number;
  parallaxX: number;
  parallaxY: number;
  tilt: number;
  pulse: number;
  drift: number;
  grayscale: number;
  upcomingBlur: number;
  aspectRatio: number;
  perspective: number;
  captionLayout: DollyCaptionLayout;
};

export function DollyGallery({
  images: imagesProp = [],
  captions,
  captionLayout = "side",
  infinite = true,
  itemWidth = 340,
  aspectRatio = 0.8,
  borderRadius = 7,
  grayscale = 1,
  perspective = 1000,
  spacing = 800,
  spread = 0.8,
  scatter = 0.1,
  revealRange = 1.5,
  passRange = 1,
  parallaxX = 0.12,
  parallaxY = 0.06,
  parallaxSmooth = 0.85,
  tilt = 4,
  pulse = 0.03,
  drift = 0.08,
  smooth = 0.85,
  wheelSpeed = 1,
  dragSpeed = 1.5,
  autoScroll = 0,
  pauseOnHover = true,
  backgroundColor = "transparent",
  upcomingBlur = 0,
  interactive = true,
  onIndexChange,
  onProgress,
  className,
  children,
}: DollyGalleryProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const rigRef = React.useRef<HTMLDivElement>(null);
  const planeRefs = React.useRef<(HTMLElement | null)[]>([]);
  const captionRefs = React.useRef<(HTMLElement | null)[]>([]);

  const images = React.useMemo(() => normalizeImages(imagesProp), [imagesProp]);
  const count = images.length;
  const hasCaptions = Boolean(captions?.length);

  const cameraTarget = React.useRef(0);
  const cameraCurrent = React.useRef(0);
  const pointerTarget = React.useRef({ x: 0, y: 0 });
  const pointerCurrent = React.useRef({ x: 0, y: 0 });
  const velocityRef = React.useRef(0);
  const hoveredRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const userPausedAutoRef = React.useRef(false);
  const lastPointerRef = React.useRef({ x: 0, y: 0, t: 0 });
  const lastIndexRef = React.useRef(-1);
  const lastProgressRef = React.useRef(Number.NaN);
  const rafRef = React.useRef(0);
  const lastFrameRef = React.useRef(0);
  const interactiveRef = React.useRef(interactive);
  interactiveRef.current = interactive;
  const lenisPausedRef = React.useRef(false);
  const widthRef = React.useRef(itemWidth);
  const containerWidthRef = React.useRef(0);

  const onIndexChangeRef = React.useRef(onIndexChange);
  onIndexChangeRef.current = onIndexChange;
  const onProgressRef = React.useRef(onProgress);
  onProgressRef.current = onProgress;

  const cfgRef = React.useRef<LiveConfig>({
    infinite,
    spacing,
    spread,
    scatter,
    revealRange,
    passRange,
    parallaxX,
    parallaxY,
    tilt,
    pulse,
    drift,
    grayscale,
    upcomingBlur,
    aspectRatio,
    perspective,
    captionLayout,
  });
  cfgRef.current = {
    infinite,
    spacing,
    spread,
    scatter,
    revealRange,
    passRange,
    parallaxX,
    parallaxY,
    tilt,
    pulse,
    drift,
    grayscale,
    upcomingBlur,
    aspectRatio,
    perspective,
    captionLayout,
  };

  const [layoutWidth, setLayoutWidth] = React.useState(itemWidth);
  const [activeIndex, setActiveIndex] = React.useState(0);
  widthRef.current = layoutWidth;

  const itemHeight = layoutWidth / aspectRatio;
  const maxCamera =
    infinite || count <= 1 ? Number.POSITIVE_INFINITY : (count - 1) * spacing;

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      containerWidthRef.current = el.clientWidth;
      const stacked = captionLayout === "stack";
      const next = Math.min(
        itemWidth,
        Math.max(
          160,
          el.clientWidth * (stacked ? 0.72 : hasCaptions ? 0.36 : 0.48),
        ),
      );
      widthRef.current = next;
      setLayoutWidth(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [captionLayout, hasCaptions, itemWidth]);

  // Resume auto-travel whenever the section becomes interactive again
  React.useEffect(() => {
    if (interactive) userPausedAutoRef.current = false;
  }, [interactive]);

  const clampCamera = React.useCallback(
    (z: number) => {
      if (infinite || count <= 1) return z;
      return clamp(z, 0, maxCamera);
    },
    [count, infinite, maxCamera],
  );

  const applyPlaneStyle = (
    el: HTMLElement,
    opts: {
      x: number;
      y: number;
      z: number;
      opacity: number;
      scale: number;
      rotX: number;
      rotY: number;
      blur: number;
      gray: number;
      steps: number;
      visible: boolean;
    },
  ) => {
    if (!opts.visible) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      return;
    }
    el.style.visibility = "visible";
    el.style.opacity = String(opts.opacity);
    el.style.transform = `translate3d(${opts.x}px, ${opts.y}px, ${opts.z}px) rotateX(${opts.rotX}deg) rotateY(${opts.rotY}deg) scale(${opts.scale})`;
    el.style.filter = [
      opts.blur > 0.25 ? `blur(${opts.blur.toFixed(2)}px)` : null,
      opts.gray > 0.02 ? `grayscale(${clamp(opts.gray, 0, 1).toFixed(3)})` : null,
    ]
      .filter(Boolean)
      .join(" ") || "none";
    el.style.zIndex = String(Math.round(10000 - Math.abs(opts.steps) * 100));
  };

  const paint = React.useCallback(() => {
    const cfg = cfgRef.current;
    const w = widthRef.current;
    const h = w / cfg.aspectRatio;
    const cam = cameraCurrent.current;
    const ptr = pointerCurrent.current;
    const speed = Math.min(1, Math.abs(velocityRef.current));
    const pulseScale = 1 + cfg.pulse * speed;
    const tiltAmt = cfg.tilt * speed;
    const driftY = -velocityRef.current * cfg.drift * h;
    const stacked = cfg.captionLayout === "stack";

    const scene = sceneRef.current;
    if (scene) scene.style.perspective = `${cfg.perspective}px`;

    const rig = rigRef.current;
    if (rig) {
      const px = ptr.x * cfg.parallaxX * w;
      const py = ptr.y * cfg.parallaxY * h + driftY;
      rig.style.transform = `translate3d(${px}px, ${py}px, ${cam}px)`;
    }

    for (let i = 0; i < count; i++) {
      const steps = i - cam / cfg.spacing;
      const visible =
        steps <= cfg.revealRange + 0.25 && steps >= -cfg.passRange - 0.25;

      const side = i % 2 === 0 ? -1 : 1;
      const scatterY = scatterSign(i) * cfg.scatter * h;
      const z = -i * cfg.spacing;

      let opacity = 1;
      if (steps > 0) opacity = 1 - steps / Math.max(0.001, cfg.revealRange);
      else if (steps < 0) opacity = 1 + steps / Math.max(0.001, cfg.passRange);
      opacity = clamp(opacity, 0, 1);

      const focused = Math.abs(steps) < 0.55;
      const scale = focused ? pulseScale : 1;
      const rotY = focused ? tiltAmt * ptr.x : stacked ? 0 : side * 2;
      const rotX = focused ? -tiltAmt * 0.35 * ptr.y : 0;

      const upcoming = Math.max(0, steps);
      const blur =
        cfg.upcomingBlur > 0 && upcoming > 0.1
          ? cfg.upcomingBlur * clamp((upcoming - 0.1) / 0.85, 0, 1)
          : 0;
      const grayDeep =
        upcoming > 0
          ? Math.min(1, cfg.grayscale + upcoming * 0.45)
          : cfg.grayscale;

      const imgX = stacked ? 0 : side * cfg.spread * w;
      // Stack: photo sits upper-center; caption clear below (no overlap)
      const imgY = stacked ? -h * 0.42 : scatterY;
      const capX = stacked ? 0 : -side * cfg.spread * w;
      const capY = stacked ? h * 0.58 : scatterY;

      const imgEl = planeRefs.current[i];
      if (imgEl) {
        applyPlaneStyle(imgEl, {
          x: imgX,
          y: imgY,
          z,
          opacity,
          scale,
          rotX,
          rotY,
          blur,
          gray: grayDeep,
          steps,
          visible,
        });
      }

      const capEl = captionRefs.current[i];
      if (capEl) {
        // Mobile stack: only the near-focus caption — ghost captions wash out text
        const capVisible = stacked ? Math.abs(steps) < 0.7 : visible;
        const capOpacity = stacked
          ? clamp(1 - Math.abs(steps) / 0.7, 0, 1)
          : opacity;
        applyPlaneStyle(capEl, {
          x: capX,
          y: capY,
          z,
          opacity: capOpacity,
          scale: stacked ? 1 : scale,
          rotX: stacked ? 0 : rotX,
          rotY: stacked ? 0 : focused ? tiltAmt * ptr.x : -side * 2,
          // Never blur captions — unreadable when soft
          blur: stacked ? 0 : blur,
          gray: 0,
          steps,
          visible: capVisible,
        });
      }
    }

    const progress = cam / cfg.spacing;
    if (Math.abs(progress - lastProgressRef.current) > 0.002) {
      lastProgressRef.current = progress;
      onProgressRef.current?.(progress);
    }

    const idx = cfg.infinite
      ? wrapIndex(Math.round(progress), count)
      : clamp(Math.round(progress), 0, count - 1);
    if (idx !== lastIndexRef.current) {
      lastIndexRef.current = idx;
      setActiveIndex(idx);
      onIndexChangeRef.current?.(idx);
    }
  }, [count]);

  React.useEffect(() => {
    if (count === 0) return;
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;
      const cfg = cfgRef.current;

      if (
        interactiveRef.current &&
        autoScroll !== 0 &&
        !userPausedAutoRef.current &&
        !(pauseOnHover && hoveredRef.current) &&
        !draggingRef.current
      ) {
        const next = cameraTarget.current + autoScroll * dt;
        if (!infinite && next >= maxCamera) {
          cameraTarget.current = maxCamera;
        } else {
          cameraTarget.current = clampCamera(next);
        }
      }

      const camLerp = 1 - Math.pow(smooth, dt * 60);
      cameraCurrent.current += (cameraTarget.current - cameraCurrent.current) * camLerp;

      if (cfg.infinite && count > 0) {
        const period = count * cfg.spacing;
        if (Math.abs(cameraCurrent.current) > period * 2) {
          const wrap = Math.round(cameraCurrent.current / period) * period;
          cameraCurrent.current -= wrap;
          cameraTarget.current -= wrap;
        }
      }

      const pLerp = 1 - Math.pow(parallaxSmooth, dt * 60);
      pointerCurrent.current.x += (pointerTarget.current.x - pointerCurrent.current.x) * pLerp;
      pointerCurrent.current.y += (pointerTarget.current.y - pointerCurrent.current.y) * pLerp;
      velocityRef.current *= Math.pow(0.9, dt * 60);

      paint();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    autoScroll,
    clampCamera,
    count,
    infinite,
    maxCamera,
    paint,
    parallaxSmooth,
    pauseOnHover,
    smooth,
  ]);

  // Global wheel while the section owns the screen (not hover-only)
  React.useEffect(() => {
    if (count === 0) return;

    const onWheel = (e: WheelEvent) => {
      if (!interactiveRef.current) {
        if (lenisPausedRef.current) {
          getActiveLenis()?.start();
          lenisPausedRef.current = false;
        }
        return;
      }

      const atStart = !infinite && cameraTarget.current <= 1;
      const atEnd = !infinite && cameraTarget.current >= maxCamera - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) {
        if (lenisPausedRef.current) {
          getActiveLenis()?.start();
          lenisPausedRef.current = false;
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      userPausedAutoRef.current = true;

      const lenis = getActiveLenis();
      if (lenis && !lenisPausedRef.current) {
        lenis.stop();
        lenisPausedRef.current = true;
      }

      const delta = e.deltaY * wheelSpeed;
      cameraTarget.current = clampCamera(cameraTarget.current + delta);
      velocityRef.current = clamp(velocityRef.current + delta * 0.0018, -2, 2);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheel, true);
  }, [clampCamera, count, infinite, maxCamera, wheelSpeed]);

  React.useEffect(() => {
    if (interactive) return;
    draggingRef.current = false;
    if (lenisPausedRef.current) {
      getActiveLenis()?.start();
      lenisPausedRef.current = false;
    }
  }, [interactive]);

  React.useEffect(() => {
    return () => {
      if (lenisPausedRef.current) {
        getActiveLenis()?.start();
        lenisPausedRef.current = false;
      }
    };
  }, []);

  React.useEffect(() => {
    paint();
  }, [layoutWidth, paint, captionLayout]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactiveRef.current) return;
    draggingRef.current = true;
    userPausedAutoRef.current = true;
    const lenis = getActiveLenis();
    if (lenis && !lenisPausedRef.current) {
      lenis.stop();
      lenisPausedRef.current = true;
    }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const root = rootRef.current;
    if (root) {
      const rect = root.getBoundingClientRect();
      pointerTarget.current = {
        x: clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
        y: clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1),
      };
    }
    if (!draggingRef.current || !interactiveRef.current) return;

    const now = performance.now();
    const dy = e.clientY - lastPointerRef.current.y;
    const dt = Math.max(1, now - lastPointerRef.current.t);
    cameraTarget.current = clampCamera(cameraTarget.current - dy * dragSpeed);
    velocityRef.current = clamp((-dy / dt) * dragSpeed * 0.12, -2, 2);
    lastPointerRef.current = { x: e.clientX, y: e.clientY, t: now };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  if (count === 0) {
    return (
      <div className={cn("relative h-full w-full", className)} style={{ backgroundColor }} />
    );
  }

  const stacked = captionLayout === "stack";
  const captionWidth = stacked
    ? Math.min(containerWidthRef.current || layoutWidth * 1.2, layoutWidth * 1.35)
    : layoutWidth * 1.05;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full touch-none select-none overflow-hidden",
        className,
      )}
      style={{ backgroundColor }}
      onPointerEnter={() => {
        hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
        pointerTarget.current = { x: 0, y: 0 };
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="region"
      aria-roledescription="3D image gallery"
      aria-label="Scroll or drag to fly through photos"
      aria-valuenow={activeIndex + 1}
      aria-valuemin={1}
      aria-valuemax={count}
    >
      <div
        ref={sceneRef}
        className="absolute inset-0"
        style={{
          perspective: `${perspective}px`,
          perspectiveOrigin: "50% 48%",
        }}
      >
        <div
          ref={rigRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: layoutWidth,
            height: itemHeight,
            marginLeft: -layoutWidth / 2,
            marginTop: -itemHeight / 2,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {images.map((img, i) => {
            const imageOnLeft = i % 2 === 0;
            return (
              <React.Fragment key={img.src}>
                <figure
                  ref={(node) => {
                    planeRefs.current[i] = node;
                  }}
                  className="absolute left-0 top-0 m-0 overflow-hidden will-change-[transform,opacity,filter]"
                  style={{
                    width: layoutWidth,
                    height: itemHeight,
                    borderRadius,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    boxShadow: "0 24px 50px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    width={Math.round(layoutWidth * 2)}
                    height={Math.round(itemHeight * 2)}
                    decoding="async"
                    draggable={false}
                    fetchPriority={i < 2 ? "high" : "auto"}
                    className="pointer-events-none h-full w-full object-cover"
                    style={{ borderRadius }}
                  />
                </figure>

                {captions?.[i] != null ? (
                  <div
                    ref={(node) => {
                      captionRefs.current[i] = node;
                    }}
                    className="absolute left-0 top-0 flex will-change-[transform,opacity,filter]"
                    style={{
                      width: captionWidth,
                      height: stacked ? itemHeight * 0.9 : itemHeight,
                      marginLeft: (layoutWidth - captionWidth) / 2,
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                      alignItems: stacked ? "flex-start" : "center",
                      justifyContent: stacked
                        ? "center"
                        : imageOnLeft
                          ? "flex-start"
                          : "flex-end",
                      textAlign: stacked ? "center" : imageOnLeft ? "left" : "right",
                    }}
                  >
                    <div
                      className={
                        stacked
                          ? "w-full max-w-full rounded-md px-3 py-3"
                          : "w-full max-w-full px-1"
                      }
                      style={
                        stacked
                          ? {
                              background:
                                "linear-gradient(180deg, rgba(13,7,32,0.82) 0%, rgba(13,7,32,0.94) 100%)",
                              boxShadow: "0 12px 40px rgba(13,7,32,0.55)",
                            }
                          : { textShadow: "0 2px 22px rgba(13,7,32,0.92)" }
                      }
                    >
                      {captions[i]}
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">{children}</div>
    </div>
  );
}

export default DollyGallery;
