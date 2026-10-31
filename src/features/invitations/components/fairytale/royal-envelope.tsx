"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";
import {
  Fleuron,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { fairytale } from "@/features/invitations/components/fairytale/fairytale-tokens";
import {
  finialBackground,
  grainOverlay,
  parchmentBackground,
  rodBackground,
  waxSealBackground,
} from "@/features/invitations/components/fairytale/textures";

gsap.registerPlugin(useGSAP);

interface Props {
  guestName: string;
  coupleNames: string;
  monogram: string;
  dateLabel: string | null;
  /** Fires on the open click (same gesture browsers need to start audio). */
  onOpenStart?: () => void;
  /** Fires when the website starts showing through the dissolving parchment. */
  onRevealStart?: () => void;
  /** Fires once the overlay is fully transparent and can be removed. */
  onOpened: () => void;
}

const PARTICLE_COUNT_DESKTOP = 28;
const PARTICLE_COUNT_MOBILE = 14;
const DUST_COUNT_DESKTOP = 36;
const DUST_COUNT_MOBILE = 18;

const revealMask =
  "radial-gradient(circle at 50% 50%, transparent var(--reveal), #000 calc(var(--reveal) + 16%))";

export function RoyalEnvelope({
  guestName,
  coupleNames,
  monogram,
  dateLabel,
  onOpenStart,
  onRevealStart,
  onOpened,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = React.useState(Boolean(reduceMotion));
  const [opening, setOpening] = React.useState(false);
  const [particleCount, setParticleCount] = React.useState(PARTICLE_COUNT_MOBILE);
  const openingRef = React.useRef(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const veilRef = React.useRef<HTMLElement>(null);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const kingdomRef = React.useRef<HTMLDivElement>(null);
  const bloomRef = React.useRef<HTMLSpanElement>(null);
  const sweepRef = React.useRef<HTMLSpanElement>(null);
  const coreGlowRef = React.useRef<HTMLSpanElement>(null);
  const luminousRef = React.useRef<HTMLSpanElement>(null);
  const sealFlareRef = React.useRef<HTMLSpanElement>(null);
  const haloRef = React.useRef<HTMLSpanElement>(null);
  const fogRefs = React.useRef<HTMLSpanElement[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const unrollRef = React.useRef<HTMLDivElement>(null);
  const parchmentRef = React.useRef<HTMLDivElement>(null);
  const sealRef = React.useRef<HTMLDivElement>(null);
  const sealGlowRef = React.useRef<HTMLSpanElement>(null);
  const guestRef = React.useRef<HTMLParagraphElement>(null);
  const linesRef = React.useRef<HTMLDivElement>(null);
  const ctaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () =>
      setParticleCount(mq.matches ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_MOBILE);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      if (
        openingRef.current ||
        !sceneRef.current ||
        !scrollRef.current ||
        !unrollRef.current ||
        !parchmentRef.current
      ) {
        return;
      }

      const setFinalState = () => {
        gsap.set(sceneRef.current, { opacity: 1 });
        gsap.set(scrollRef.current, { opacity: 1, y: 0, rotate: 0, scale: 1 });
        gsap.set(unrollRef.current, { height: "auto" });
        gsap.set(parchmentRef.current, { opacity: 1, rotateX: 0 });
        if (sealRef.current) gsap.set(sealRef.current, { opacity: 1, scale: 1, y: 0 });
        if (sealGlowRef.current) gsap.set(sealGlowRef.current, { opacity: 0.75, scale: 1.12 });
        if (guestRef.current) gsap.set(guestRef.current, { opacity: 1, y: 0 });
        if (linesRef.current) {
          gsap.set(linesRef.current.children, { opacity: 1, y: 0 });
        }
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 1, y: 0 });
        setReady(true);
      };

      if (reduceMotion) {
        setFinalState();
        return;
      }

      gsap.set(sceneRef.current, { opacity: 0 });
      gsap.set(scrollRef.current, { opacity: 0, y: 72, rotate: -2.5, scale: 0.94 });
      // Collapsed height keeps the bottom rod tucked under the top rod; layout
      // expansion then carries the bottom bracket down with the parchment.
      gsap.set(unrollRef.current, { height: 0 });
      gsap.set(parchmentRef.current, {
        opacity: 0.92,
        rotateX: 28,
        transformOrigin: "50% 0%",
      });
      if (sealRef.current) gsap.set(sealRef.current, { opacity: 1, scale: 1, y: 0 });
      if (sealGlowRef.current) gsap.set(sealGlowRef.current, { opacity: 0.35, scale: 1 });
      if (guestRef.current) gsap.set(guestRef.current, { opacity: 0, y: 14 });
      if (linesRef.current) {
        gsap.set(linesRef.current.children, { opacity: 0, y: 16 });
      }
      if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 0, y: 18 });

      const fog = fogRefs.current.filter(Boolean);
      fog.forEach((el, i) => {
        gsap.set(el, { opacity: 0, x: i % 2 === 0 ? -40 : 40 });
      });

      const particles = sceneRef.current.querySelectorAll<HTMLElement>("[data-particle]");
      gsap.set(particles, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => setReady(true),
      });

      tl.to(sceneRef.current, { opacity: 1, duration: 1.35, ease: "power1.out" }, 0);

      fog.forEach((el, i) => {
        tl.to(
          el,
          {
            opacity: i === 1 ? 0.45 : 0.28,
            x: 0,
            duration: 1.8,
            ease: "sine.out",
          },
          0.2 + i * 0.15,
        );
      });

      tl.to(
        particles,
        {
          opacity: 0.85,
          y: 0,
          duration: 1.4,
          stagger: { each: 0.04, from: "random" },
          ease: "power1.out",
        },
        0.35,
      );

      tl.to(
        scrollRef.current,
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.55,
          ease: "power3.out",
        },
        0.55,
      );

      tl.to(
        unrollRef.current,
        {
          height: "auto",
          duration: 2.2,
          ease: "power2.inOut",
        },
        1.35,
      );

      tl.to(
        parchmentRef.current,
        {
          rotateX: 0,
          opacity: 1,
          duration: 2.2,
          ease: "power2.out",
        },
        1.35,
      );

      if (sealGlowRef.current) {
        tl.to(
          sealGlowRef.current,
          {
            opacity: 0.9,
            scale: 1.22,
            duration: 0.9,
            ease: "sine.inOut",
          },
          2.9,
        );
        tl.to(
          sealGlowRef.current,
          {
            opacity: 0.55,
            scale: 1.08,
            duration: 1.1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
          },
          3.7,
        );
      }

      if (guestRef.current) {
        tl.to(guestRef.current, { opacity: 1, y: 0, duration: 0.95, ease: "power2.out" }, 3.55);
      }

      if (linesRef.current) {
        tl.to(
          linesRef.current.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.14,
            ease: "power2.out",
          },
          4.05,
        );
      }

      if (ctaRef.current) {
        tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" }, 5.0);
      }

      // Idle atmosphere after intro
      fog.forEach((el, i) => {
        gsap.to(el, {
          x: i % 2 === 0 ? 28 : -24,
          duration: 10 + i * 2.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 5.2,
        });
      });

      particles.forEach((el, i) => {
        gsap.to(el, {
          y: `-=${12 + (i % 5) * 6}`,
          x: `+=${(i % 2 === 0 ? 1 : -1) * (4 + (i % 4) * 3)}`,
          opacity: 0.25 + (i % 5) * 0.12,
          duration: 3.2 + (i % 6) * 0.55,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 5.2 + (i % 8) * 0.12,
        });
      });

      return () => {
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [reduceMotion, particleCount] },
  );

  const playOpening = contextSafe(() => {
    const root = rootRef.current;
    const veil = veilRef.current;
    const scroll = scrollRef.current;
    if (!root || !veil || !scroll) {
      onRevealStart?.();
      onOpened();
      return;
    }

    if (reduceMotion) {
      gsap
        .timeline({ onComplete: onOpened })
        .call(() => onRevealStart?.(), undefined, 0)
        .to(root, { opacity: 0, duration: 0.6, ease: "power1.inOut" }, 0);
      return;
    }

    const fog = fogRefs.current.filter(Boolean);
    const ambient = gsap.utils.toArray<HTMLElement>("[data-particle]", root);
    const dust = gsap.utils.toArray<HTMLElement>("[data-dust]", root);
    const rods = gsap.utils.toArray<HTMLElement>("[data-rod]", root);
    const shadow = root.querySelector<HTMLElement>("[data-scroll-shadow]");
    gsap.killTweensOf([...fog, ...ambient]);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const vmin = Math.min(vw, vh);
    const vmax = Math.max(vw, vh);
    const rect = scroll.getBoundingClientRect();
    const currentScale = Number(gsap.getProperty(scroll, "scale")) || 1;
    const coverScale = Math.max(vw / rect.width, vh / rect.height) * 1.25 * currentScale;
    const centerLift = vh / 2 - (rect.top + rect.height / 2);

    gsap.set(veil, { "--reveal": "-16%" });
    gsap.set(dust, { x: 0, y: 0, opacity: 0, scale: 0.5, rotate: 0 });
    if (sweepRef.current) gsap.set(sweepRef.current, { xPercent: -130, skewX: -16, opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: onOpened,
    });

    // 0 – 0.5s: the seal awakens and the dust stirs.
    if (sealGlowRef.current) {
      tl.to(sealGlowRef.current, { opacity: 1, scale: 1.9, duration: 0.6, ease: "power2.out" }, 0);
    }
    if (sealFlareRef.current) {
      tl.fromTo(
        sealFlareRef.current,
        { opacity: 0, scale: 0.4 },
        { opacity: 0.95, scale: 1.3, duration: 0.75, ease: "power2.out" },
        0.05,
      );
    }
    if (sealRef.current) {
      tl.to(
        sealRef.current,
        { scale: 1.08, duration: 0.3, ease: "sine.out", yoyo: true, repeat: 1 },
        0,
      );
    }
    if (ctaRef.current) {
      tl.to(ctaRef.current, { opacity: 0, y: 12, duration: 0.5, ease: "power1.in" }, 0);
    }
    tl.to(
      ambient,
      {
        opacity: 1,
        scale: 1.6,
        x: (_i, el: HTMLElement) => (parseFloat(el.style.left) - 50) * 1.8,
        y: (_i, el: HTMLElement) => (parseFloat(el.style.top) - 50) * 1.4,
        duration: 1.4,
        ease: "power2.out",
        stagger: { each: 0.015, from: "center" },
      },
      0.05,
    );

    // 0.5 – 1.5s: the parchment unfolds and glows from its center.
    tl.to(
      scroll,
      { scale: currentScale * 1.12, y: "-=6", duration: 1, ease: "power2.inOut" },
      0.45,
    );
    if (shadow) tl.to(shadow, { opacity: 0, duration: 0.8 }, 0.6);
    if (haloRef.current) {
      tl.fromTo(
        haloRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1.15, duration: 1.2, ease: "power2.out" },
        0.15,
      );
    }
    if (coreGlowRef.current) {
      tl.fromTo(
        coreGlowRef.current,
        { opacity: 0, scale: 0.2 },
        { opacity: 0.95, scale: 3.4, duration: 1.3, ease: "power2.out" },
        0.55,
      );
    }
    const softText = [guestRef.current, linesRef.current].filter(Boolean);
    tl.to(softText, { opacity: 0.55, duration: 0.9 }, 0.7);

    // 1.5 – 2.5s: the scroll rushes toward the camera as light floods the scene.
    tl.to(scroll, { scale: coverScale, y: centerLift, duration: 1.15, ease: "power3.in" }, 1.4);
    tl.to(
      rods,
      { opacity: 0, y: (i) => (i === 0 ? -28 : 28), duration: 0.6, ease: "power1.in" },
      1.45,
    );
    if (luminousRef.current) tl.to(luminousRef.current, { opacity: 1, duration: 0.95 }, 1.45);
    if (kingdomRef.current) tl.to(kingdomRef.current, { opacity: 1, duration: 1.1 }, 1.4);
    if (sceneRef.current) tl.to(sceneRef.current, { opacity: 0, duration: 1.1 }, 1.5);
    if (bloomRef.current) {
      tl.fromTo(
        bloomRef.current,
        { opacity: 0, scale: 0.25 },
        { opacity: 0.95, scale: 1.35, duration: 1.1, ease: "power2.out" },
        1.55,
      );
    }
    tl.call(() => onRevealStart?.(), undefined, 2.4);

    // 2.5 – 3.6s: the parchment dissolves outward into golden dust.
    tl.call(
      () => {
        veil.style.setProperty("mask-image", revealMask);
        veil.style.setProperty("-webkit-mask-image", revealMask);
      },
      undefined,
      2.45,
    );
    tl.to(veil, { "--reveal": "100%", duration: 1.35, ease: "power2.inOut" }, 2.45);
    dust.forEach((el, i) => {
      const angle = Number(el.dataset.angle);
      const from = vmin * (0.08 + (i % 5) * 0.03);
      const to = vmax * (0.6 + (i % 7) * 0.06);
      const at = 2.45 + (i / dust.length) * 0.3 + (i % 4) * 0.04;
      tl.set(el, { x: Math.cos(angle) * from, y: Math.sin(angle) * from }, at);
      tl.to(
        el,
        {
          x: Math.cos(angle) * to,
          y: Math.sin(angle) * to,
          rotate: (i % 2 === 0 ? 1 : -1) * (40 + (i % 5) * 25),
          scale: 0.35,
          duration: 1.35,
          ease: "power2.out",
        },
        at,
      );
      tl.to(el, { opacity: 1, scale: 1.1, duration: 0.3, ease: "power1.out" }, at);
      tl.to(el, { opacity: 0, duration: 0.7, ease: "power1.in" }, at + 0.65);
    });
    if (sweepRef.current) {
      tl.to(sweepRef.current, { xPercent: 330, duration: 1.2, ease: "power1.inOut" }, 2.55);
      tl.to(sweepRef.current, { opacity: 1, duration: 0.35, ease: "power1.out" }, 2.55);
      tl.to(sweepRef.current, { opacity: 0, duration: 0.45, ease: "power1.in" }, 3.3);
    }
  });

  function openInvitation() {
    if (!ready || openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    onOpenStart?.();
    playOpening();
  }

  const dust = React.useMemo(() => {
    const count = particleCount >= PARTICLE_COUNT_DESKTOP ? DUST_COUNT_DESKTOP : DUST_COUNT_MOBILE;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i / count) * Math.PI * 2 + ((i * 7) % 5) * 0.09,
      fleck: i % 4 === 0,
      size: i % 4 === 0 ? 4 + (i % 3) * 1.5 : 1.8 + (i % 5) * 0.9,
    }));
  }, [particleCount]);

  const particles = React.useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 37) % 88)}%`,
        top: `${8 + ((i * 53) % 78)}%`,
        size: 1.5 + (i % 4) * 0.9,
        delay: (i % 7) * 0.1,
      })),
    [particleCount],
  );

  return (
    <div ref={rootRef} className="relative h-full min-h-[100svh]">
      <section
        ref={veilRef}
        className="relative flex h-full min-h-[100svh] items-center justify-center overflow-hidden bg-[#22243A] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]"
      >
        <div
          ref={kingdomRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            backgroundImage: [
              "radial-gradient(ellipse 60% 50% at 50% 46%, #FFF8EA 0%, rgba(243,231,211,0.95) 38%, transparent 72%)",
              "radial-gradient(ellipse 70% 60% at 18% 82%, rgba(201,184,232,0.55), transparent 70%)",
              "radial-gradient(ellipse 60% 50% at 84% 16%, rgba(232,184,199,0.35), transparent 70%)",
              "linear-gradient(180deg, #E9DDF2 0%, #F3E7D3 52%, #DCCDEB 100%)",
            ].join(", "),
          }}
        />
        <div ref={sceneRef} aria-hidden className="pointer-events-none absolute inset-0">
          <AtmosphericBackdrop />
          <CastleSilhouette />
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) fogRefs.current[i] = el;
              }}
              className="absolute inset-x-[-20%] h-[38%] blur-2xl"
              style={{
                top: `${18 + i * 22}%`,
                backgroundImage:
                  i === 1
                    ? "linear-gradient(90deg, transparent, rgba(232,212,168,0.22), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(243,231,211,0.14), transparent)",
              }}
            />
          ))}
          {!reduceMotion &&
            particles.map((p) => (
              <span
                key={p.id}
                data-particle
                className="absolute rounded-full"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  backgroundColor: fairytale.gold,
                  boxShadow: `0 0 ${4 + (p.id % 3) * 2}px rgba(221,191,141,0.55)`,
                }}
              />
            ))}
          <div
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{ backgroundImage: grainOverlay }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 90% 80% at 50% 45%,transparent 50%,rgba(0,0,0,0.58) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
          <div
            ref={scrollRef}
            className="relative w-[min(92vw,22rem)] origin-center scale-[0.92] sm:w-[min(92vw,24rem)] sm:scale-100"
            style={{ perspective: "1400px" }}
          >
            <span
              ref={haloRef}
              aria-hidden
              className="pointer-events-none absolute -inset-16 z-0 rounded-[40%] opacity-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,222,150,0.55) 0%, rgba(232,190,112,0.28) 45%, transparent 72%)",
              }}
            />
            <span
              aria-hidden
              data-scroll-shadow
              className="absolute -bottom-6 left-[8%] z-0 block h-16 w-[84%] rounded-[50%] bg-black/55 blur-3xl"
            />

            <ScrollRod position="top" />

            {/* Height-driven reveal: bottom rod is a sibling so it rides the leading edge. */}
            <div ref={unrollRef} className="relative overflow-hidden will-change-[height]">
              <div
                ref={parchmentRef}
                className="relative mx-[6%] overflow-hidden"
                style={{
                  backgroundImage: parchmentBackground,
                  boxShadow:
                    "0 22px 48px rgba(0,0,0,0.45), inset 0 0 40px rgba(139,98,48,0.12), inset 0 1px 0 rgba(255,255,255,0.35)",
                  transformStyle: "preserve-3d",
                  perspective: "900px",
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 18%, transparent 82%, rgba(120,80,40,0.12)), repeating-linear-gradient(90deg, transparent 0 18px, rgba(139,98,48,0.035) 18px 19px)",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-2 border border-[#C9A66B]/45 sm:inset-2.5"
                />
                <span
                  aria-hidden
                  className="absolute inset-3 border border-[#C9A66B]/20 sm:inset-3.5"
                />

                <div className="relative flex flex-col items-center px-5 py-5 text-center sm:px-8 sm:py-10">
                  <div
                    ref={sealRef}
                    className="relative mb-3 flex items-center justify-center sm:mb-6"
                  >
                    <span
                      ref={sealGlowRef}
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,191,141,0.55),transparent_68%)]"
                    />
                    <span
                      ref={sealFlareRef}
                      aria-hidden
                      className="pointer-events-none absolute h-40 w-40 rounded-full opacity-0"
                      style={{
                        left: "calc(50% - 5rem)",
                        top: "calc(50% - 5rem)",
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,226,150,0.95) 0%, rgba(232,186,104,0.6) 30%, rgba(221,171,96,0.22) 52%, transparent 70%)",
                      }}
                    />
                    <WaxSeal monogram={monogram} />
                  </div>

                  <p ref={guestRef} className="max-w-full">
                    <span
                      className={cn(smallCaps, "block text-[10px] text-[#9b7b62] sm:text-[11px]")}
                    >
                      Hand delivered for
                    </span>
                    <span
                      className={cn(
                        displayFont,
                        "mt-2 block truncate text-xl italic text-[#4a3236] sm:text-2xl",
                      )}
                    >
                      {guestName}
                    </span>
                  </p>

                  <div ref={linesRef} className="mt-3 flex w-full flex-col items-center sm:mt-6">
                    <span className="hidden sm:block">
                      <Fleuron className="w-20 text-[#C9A66B]" />
                    </span>
                    <span
                      className={cn(
                        displayFont,
                        "mt-2 text-base font-light leading-none text-[#B76E79] sm:mt-4 sm:text-2xl",
                      )}
                    >
                      {monogram}
                    </span>
                    <span
                      className={cn(
                        displayFont,
                        "mt-2 max-w-[16rem] text-balance text-[clamp(1.05rem,4.4vw,1.85rem)] font-light leading-[1.05] text-[#4a3236] sm:mt-3",
                      )}
                    >
                      {coupleNames}
                    </span>
                    <span
                      className={cn(
                        scriptFont,
                        "mt-1.5 max-w-full truncate text-sm text-[#B76E79] sm:mt-3 sm:text-lg",
                      )}
                    >
                      invite {guestName}
                    </span>
                    {dateLabel && (
                      <span
                        className={cn(
                          smallCaps,
                          "mt-2 text-[10px] text-[#9b7b62] sm:mt-4 sm:text-[11px]",
                        )}
                      >
                        {dateLabel}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  ref={coreGlowRef}
                  aria-hidden
                  className="pointer-events-none absolute z-10 h-64 w-64 rounded-full opacity-0"
                  style={{
                    left: "calc(50% - 8rem)",
                    top: "calc(50% - 8rem)",
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,246,222,0.98) 0%, rgba(255,222,150,0.75) 26%, rgba(232,190,112,0.32) 52%, transparent 72%)",
                  }}
                />
                <span
                  ref={luminousRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(ellipse 75% 65% at 50% 50%, #FFFBF1 0%, #FBF0DA 45%, #F3E2BE 100%)",
                  }}
                />
              </div>
            </div>

            <ScrollRod position="bottom" />
          </div>

          <div
            ref={ctaRef}
            className="relative z-30 mt-6 flex flex-col items-center gap-2.5 text-center sm:mt-12 sm:gap-3"
          >
            <p className={cn(smallCaps, "text-[10px] text-[#E8D4A8]/85 sm:text-[11px]")}>
              A private invitation awaits
            </p>
            <button
              type="button"
              onClick={openInvitation}
              disabled={!ready || opening}
              aria-label={`Open Invitation, ${guestName}`}
              className={cn(
                displayFont,
                "min-h-11 rounded-sm border border-[#DDBF8D]/55 bg-[#DDBF8D]/12 px-7 py-2.5 text-lg italic text-[#F3E7D3] transition-colors",
                "hover:border-[#DDBF8D] hover:bg-[#DDBF8D]/22 hover:text-[#DDBF8D]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#22243A]",
                "disabled:cursor-wait disabled:opacity-50",
              )}
            >
              Open Invitation
            </button>
          </div>
        </div>

        <span
          ref={bloomRef}
          aria-hidden
          className="pointer-events-none absolute z-20 h-[120vmax] w-[120vmax] rounded-full opacity-0"
          style={{
            left: "calc(50% - 60vmax)",
            top: "calc(50% - 60vmax)",
            backgroundImage:
              "radial-gradient(circle, rgba(255,250,238,0.98) 0%, rgba(250,236,204,0.9) 28%, rgba(232,212,168,0.55) 48%, rgba(201,184,232,0.2) 62%, transparent 72%)",
          }}
        />
      </section>

      <div aria-hidden className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        <span
          ref={sweepRef}
          className="absolute -inset-y-[20%] left-0 w-[45vw] opacity-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,244,220,0.08) 25%, rgba(255,240,205,0.5) 50%, rgba(255,244,220,0.08) 75%, transparent 100%)",
          }}
        />
        {dust.map((d) => (
          <span
            key={d.id}
            data-dust
            data-angle={d.angle}
            className={cn(
              "absolute left-1/2 top-1/2 opacity-0",
              d.fleck ? "rounded-[1px]" : "rounded-full",
            )}
            style={{
              width: d.size,
              height: d.fleck ? d.size * 0.7 : d.size,
              backgroundColor: d.fleck ? "#F6E7C6" : fairytale.gold,
              boxShadow: d.fleck
                ? "0 0 6px rgba(255,240,205,0.65)"
                : `0 0 ${6 + (d.id % 3) * 3}px rgba(255,226,160,0.85)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AtmosphericBackdrop() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 55% 42% at 50% 38%, rgba(232,212,168,0.22), transparent 70%)",
            "radial-gradient(ellipse 40% 30% at 72% 62%, rgba(201,184,232,0.1), transparent 68%)",
            "linear-gradient(180deg, #1a1c2e 0%, #22243A 48%, #12131f 100%)",
          ].join(", "),
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent, rgba(34,36,58,0.55) 35%, rgba(10,10,18,0.92))",
        }}
      />
    </div>
  );
}

function CastleSilhouette() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 280"
      className="absolute inset-x-0 bottom-[8%] mx-auto h-[min(42vw,16rem)] w-[min(100vw,46rem)] text-black/55"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="castleFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        fill="url(#castleFade)"
        d="M40 280V168l28-10 18 22 22-36 20 18 16-28h24l12-42 14 42h36l8-22 10 22h28V88l22-18 22 18v42h20l14-48 16 48h34V72l26-28 26 28v98h18l12-30 14 30h40V140l30-14 24 28 20-20 18 24v122H40Z"
      />
      <g fill="#DDBF8D" opacity="0.35">
        <rect x="168" y="188" width="5" height="8" rx="1" />
        <rect x="292" y="176" width="5" height="8" rx="1" />
        <rect x="410" y="164" width="5" height="8" rx="1" />
        <rect x="538" y="182" width="5" height="8" rx="1" />
        <rect x="646" y="170" width="5" height="8" rx="1" />
      </g>
    </svg>
  );
}

function ScrollRod({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      data-rod={position}
      className={cn(
        "relative z-20 mx-auto flex h-4 w-[min(100%,26rem)] items-center justify-between sm:h-5",
        position === "top" ? "mb-[-1px]" : "mt-[-1px]",
      )}
    >
      <span
        className="relative z-10 h-5 w-5 shrink-0 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:h-6 sm:w-6"
        style={{ backgroundImage: finialBackground }}
      />
      <span
        className="absolute inset-x-3 top-1/2 h-[10px] -translate-y-1/2 rounded-sm shadow-[0_3px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] sm:h-3"
        style={{ backgroundImage: rodBackground }}
      />
      <span
        className="relative z-10 h-5 w-5 shrink-0 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:h-6 sm:w-6"
        style={{ backgroundImage: finialBackground }}
      />
    </div>
  );
}

function WaxSeal({ monogram }: { monogram: string }) {
  return (
    <span className="relative flex h-12 w-12 items-center justify-center sm:h-16 sm:w-16">
      <span className="absolute right-1/2 top-[62%] block h-7 w-2.5 origin-top-right rotate-[16deg] bg-[#8f4a57] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]" />
      <span className="absolute left-1/2 top-[62%] block h-7 w-2.5 origin-top-left -rotate-[16deg] bg-[#743844] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]" />
      <span
        className="relative flex h-full w-full items-center justify-center rounded-[47%_53%_50%_50%/52%_48%_52%_48%] shadow-[0_7px_16px_rgba(0,0,0,0.42),inset_0_-3px_6px_rgba(0,0,0,0.25)]"
        style={{ backgroundImage: waxSealBackground }}
      >
        <span className="absolute inset-[6px] rounded-full border border-[#f3c5cc]/40" />
        <span
          className={cn(
            displayFont,
            "relative max-w-[3rem] truncate text-[11px] font-semibold tracking-wide text-[#fbe3e6] sm:text-xs",
          )}
        >
          {monogram}
        </span>
      </span>
    </span>
  );
}
