"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";
import {
  Fleuron,
  GoldDivider,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { fairytale } from "@/features/invitations/components/fairytale/fairytale-tokens";
import {
  finialBackground,
  grainOverlay,
  parchmentBackground,
  waxSealBackground,
} from "@/features/invitations/components/fairytale/textures";
import { IntroCastleScene } from "@/features/invitations/components/fairytale/intro-castle-scene";
import { MagicalStars } from "@/features/invitations/components/fairytale/magical-stars";

gsap.registerPlugin(useGSAP);

interface Props {
  guestName: string;
  coupleNames: string;
  monogram: string;
  dateLabel: string | null;
  /** Fires on the open click (same gesture browsers need to start audio). */
  onOpenStart?: () => void;
  /** Fires as the wax seal breaks, about a second into the opening. */
  onSealBreak?: () => void;
  /** Fires when the website starts showing through the dissolving castle scene. */
  onRevealStart?: () => void;
  /** Fires once the overlay is fully transparent and can be removed. */
  onOpened: () => void;
}

const BUDGET = {
  mobile: { lanterns: 8, dust: 14, stars: 22 },
  desktop: { lanterns: 18, dust: 36, stars: 48 },
} as const;

/** Timeline marks (seconds from the open click). Kept under ~9s total. */
const T = {
  sealBreak: 0.75,
  unroll: 0.95,
  text: 2.1,
  /** Hold the open invitation long enough to read before it turns to stars. */
  dissolve: 4.6,
  /** Stars finish replacing the card; website fade begins. */
  reveal: 6.6,
  skipTo: 6.4,
  opened: 8.6,
} as const;

const rollGradient =
  "linear-gradient(180deg, #8c6a3c 0%, #dcc292 16%, #f8ecd0 36%, #fbf3e0 46%, #efdcb4 64%, #c4a06a 84%, #6e5230 100%)";
const capGradient =
  "linear-gradient(90deg, #6b4c22 0%, #c9a14f 30%, #f4dc9a 50%, #c9a14f 70%, #6b4c22 100%)";
const ribbonGradient = "linear-gradient(90deg, #6e1f2d 0%, #a83e50 45%, #c55a6a 55%, #7a2433 100%)";

export function RoyalEnvelope({
  guestName,
  coupleNames,
  monogram,
  dateLabel,
  onOpenStart,
  onSealBreak,
  onRevealStart,
  onOpened,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = React.useState(false);
  const [opening, setOpening] = React.useState(false);
  const [skippable, setSkippable] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const budget = isDesktop ? BUDGET.desktop : BUDGET.mobile;

  const openingRef = React.useRef(false);
  const openTlRef = React.useRef<gsap.core.Timeline | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const veilRef = React.useRef<HTMLElement>(null);
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const sheetBodyRef = React.useRef<HTMLDivElement>(null);
  const rolledCoreRef = React.useRef<HTMLSpanElement>(null);
  const rollTopRef = React.useRef<HTMLDivElement>(null);
  const rollBottomRef = React.useRef<HTMLDivElement>(null);
  const ribbonBandRef = React.useRef<HTMLSpanElement>(null);
  const sealRef = React.useRef<HTMLDivElement>(null);
  const sealLeftRef = React.useRef<HTMLSpanElement>(null);
  const sealRightRef = React.useRef<HTMLSpanElement>(null);
  const sealGlowRef = React.useRef<HTMLSpanElement>(null);
  const sealFlareRef = React.useRef<HTMLSpanElement>(null);
  const haloRef = React.useRef<HTMLSpanElement>(null);
  const sheetGlowRef = React.useRef<HTMLSpanElement>(null);
  const ctaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      const root = rootRef.current;
      if (openingRef.current || !root || !sceneRef.current || !scrollRef.current || !sheetRef.current) {
        return;
      }

      const q = gsap.utils.selector(root);
      const lanterns = q<HTMLElement>("[data-lantern]");
      const lines = q<HTMLElement>("[data-sheet-line]");
      const tails = q<HTMLElement>("[data-ribbon-tail]");
      const stars = q<HTMLElement>("[data-star]");
      const blurLayer = q<HTMLElement>("[data-castle-layer='blur']");
      const camera = q<HTMLElement>("[data-castle-camera]");
      const sheetShadow = q<HTMLElement>("[data-sheet-shadow]");
      const lanternOpacity = (_i: number, el: HTMLElement) =>
        Number(el.style.getPropertyValue("--lantern-opacity")) || 0.8;

      if (reduceMotion) {
        gsap.set(sceneRef.current, { opacity: 1 });
        gsap.set(blurLayer, { opacity: 0.55 });
        gsap.set(lanterns, { opacity: lanternOpacity });
        gsap.set(sheetRef.current, { height: "auto", opacity: 1 });
        if (rolledCoreRef.current) gsap.set(rolledCoreRef.current, { opacity: 0, height: 0 });
        gsap.set(sheetShadow, { opacity: 1 });
        gsap.set(lines, { opacity: 1, y: 0 });
        gsap.set(
          [rollTopRef.current, rollBottomRef.current, ribbonBandRef.current, sealRef.current, ...tails].filter(
            Boolean,
          ),
          { opacity: 0 },
        );
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 1, y: 0 });
        setReady(true);
        return;
      }

      gsap.set(sceneRef.current, { opacity: 0 });
      gsap.set(camera, { scale: 1.18, transformOrigin: "50% 45%" });
      gsap.set(lanterns, { opacity: 0, y: 30 });
      gsap.set(scrollRef.current, { opacity: 0, y: 56, scale: 0.94 });
      // Invitation sheet stays height 0. The two rods + rolled core read as a real closed scroll.
      gsap.set(sheetRef.current, { height: 0, opacity: 1 });
      if (rolledCoreRef.current) gsap.set(rolledCoreRef.current, { opacity: 1, height: "auto" });
      gsap.set(sheetShadow, { opacity: 0 });
      gsap.set(lines, { opacity: 0, y: 12 });
      gsap.set(stars, { opacity: 0, scale: 0.4 });
      if (sealGlowRef.current) gsap.set(sealGlowRef.current, { opacity: 0.4, scale: 1 });
      if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 0, y: 16 });

      const tl = gsap.timeline({ onComplete: () => setReady(true) });
      tl.to(sceneRef.current, { opacity: 1, duration: 1.3, ease: "power1.out" }, 0);
      tl.to(
        lanterns,
        {
          opacity: lanternOpacity,
          y: 0,
          duration: 1.6,
          stagger: { each: 0.06, from: "random" },
          ease: "power1.out",
        },
        0.3,
      );
      tl.to(
        scrollRef.current,
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "power3.out" },
        0.5,
      );
      if (ctaRef.current) {
        tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 1.4);
      }

      // Soft idle twinkle — sparse so the scene stays calm before open.
      stars.forEach((el, i) => {
        if (i % 4 !== 0) return;
        gsap.to(el, {
          opacity: 0.28 + (i % 4) * 0.08,
          scale: 0.9 + (i % 3) * 0.1,
          duration: 2.1 + (i % 5) * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.8 + Number(el.dataset.delay || 0),
        });
      });

      lanterns.forEach((el, i) => {
        gsap.to(el, {
          y: `-=${10 + (i % 4) * 5}`,
          x: `+=${(i % 2 === 0 ? 1 : -1) * (3 + (i % 3) * 2)}`,
          duration: 5.6 + (i % 5) * 0.9,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.9 + (i % 6) * 0.18,
        });
      });
      gsap.to(scrollRef.current, {
        y: -4,
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.9,
      });
      if (sealGlowRef.current) {
        gsap.to(sealGlowRef.current, {
          opacity: 0.68,
          scale: 1.1,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.9,
        });
      }

      return () => {
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [reduceMotion, isDesktop] },
  );

  const playOpening = contextSafe(() => {
    const root = rootRef.current;
    const veil = veilRef.current;
    const scroll = scrollRef.current;
    const sheet = sheetRef.current;
    if (!root || !veil || !scroll || !sheet) {
      onRevealStart?.();
      onOpened();
      return;
    }

    if (reduceMotion) {
      gsap
        .timeline({ onComplete: onOpened })
        .call(() => onSealBreak?.(), undefined, 0)
        .call(() => onRevealStart?.(), undefined, 0)
        .to(root, { opacity: 0, duration: 0.6, ease: "power1.inOut" }, 0);
      return;
    }

    const q = gsap.utils.selector(root);
    const lanterns = q<HTMLElement>("[data-lantern]");
    const dust = q<HTMLElement>("[data-dust]");
    const tails = q<HTMLElement>("[data-ribbon-tail]");
    const stars = q<HTMLElement>("[data-star]");
    const blurLayer = q<HTMLElement>("[data-castle-layer='blur']");
    const camera = q<HTMLElement>("[data-castle-camera]");
    const scrim = q<HTMLElement>("[data-castle-scrim]");
    const shadow = q<HTMLElement>("[data-scroll-shadow]");
    const sheetShadow = q<HTMLElement>("[data-sheet-shadow]");
    const lines = q<HTMLElement>("[data-sheet-line]");

    gsap.killTweensOf([scroll, ...lanterns, ...stars]);
    if (sealGlowRef.current) gsap.killTweensOf(sealGlowRef.current);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const vmin = Math.min(vw, vh);
    const vmax = Math.max(vw, vh);
    const openHeight = sheetBodyRef.current?.offsetHeight ?? sheet.scrollHeight;

    gsap.set(dust, { x: 0, y: 0, opacity: 0, scale: 0.5, rotate: 0 });
    gsap.set(stars, { x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: onOpened,
    });
    openTlRef.current = tl;

    const burstDust = (
      els: HTMLElement[],
      at: number,
      inner: number,
      outer: number,
      duration: number,
    ) => {
      els.forEach((el, i) => {
        const angle = Number(el.dataset.angle);
        const from = inner * (0.6 + (i % 5) * 0.15);
        const to = outer * (0.7 + (i % 7) * 0.06);
        const start = at + (i / els.length) * 0.25 + (i % 4) * 0.03;
        tl.set(
          el,
          { x: Math.cos(angle) * from, y: Math.sin(angle) * from, opacity: 0, scale: 1, rotate: 0 },
          start,
        );
        tl.to(
          el,
          {
            x: Math.cos(angle) * to,
            y: Math.sin(angle) * to,
            rotate: (i % 2 === 0 ? 1 : -1) * (40 + (i % 5) * 25),
            scale: 0.35,
            duration,
            ease: "power2.out",
          },
          start,
        );
        tl.to(el, { opacity: 1, duration: 0.25, ease: "power1.out" }, start);
        tl.to(el, { opacity: 0, duration: duration * 0.5, ease: "power1.in" }, start + duration * 0.45);
      });
    };

    /** Stars bloom, hold a soft twinkle, then drift outward and fade. */
    const bloomStars = (at: number, hold: number, drift: number) => {
      stars.forEach((el, i) => {
        const angle = Number(el.dataset.angle);
        const start = at + Number(el.dataset.delay || 0) * 0.6 + (i % 5) * 0.04;
        const peak = 0.55 + (i % 4) * 0.12;
        tl.to(
          el,
          { opacity: peak, scale: 1 + (i % 3) * 0.25, duration: 0.55, ease: "power2.out" },
          start,
        );
        tl.to(
          el,
          {
            opacity: peak * 0.7,
            scale: 0.9 + (i % 3) * 0.2,
            duration: 0.45,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
          },
          start + 0.55,
        );
        tl.to(
          el,
          {
            x: Math.cos(angle) * drift * (0.55 + (i % 5) * 0.12),
            y: Math.sin(angle) * drift * (0.55 + (i % 5) * 0.12) - drift * 0.15,
            opacity: 0,
            scale: 0.2,
            duration: 1.2,
            ease: "power2.in",
          },
          start + hold,
        );
      });
    };

    // 0 – 1s: the seal awakens, stars begin to gather.
    if (ctaRef.current) {
      tl.to(ctaRef.current, { opacity: 0, y: 12, duration: 0.5, ease: "power1.in" }, 0);
    }
    tl.to(scroll, { y: 0, duration: 0.6, ease: "sine.out" }, 0);
    if (sealGlowRef.current) {
      tl.to(sealGlowRef.current, { opacity: 1, scale: 2, duration: 0.8, ease: "power2.out" }, 0);
    }
    if (sealFlareRef.current) {
      tl.fromTo(
        sealFlareRef.current,
        { opacity: 0, scale: 0.4 },
        { opacity: 0.95, scale: 1.4, duration: 0.8, ease: "power2.out" },
        0.1,
      );
    }
    if (sealRef.current) {
      tl.to(sealRef.current, { scale: 1.1, duration: 0.35, ease: "sine.out", yoyo: true, repeat: 1 }, 0.1);
    }
    tl.to(
      stars,
      {
        opacity: (_i, el: HTMLElement) => 0.4 + (Number(el.dataset.delay) || 0),
        scale: 1,
        duration: 0.9,
        stagger: { each: 0.02, from: "center" },
        ease: "power2.out",
      },
      0.15,
    );
    tl.to(lanterns, { y: "-=18", duration: T.dissolve, ease: "none" }, 0);

    // 1 – 3s: the seal breaks, stars surge, and the scroll unrolls.
    tl.call(() => onSealBreak?.(), undefined, T.sealBreak);
    tl.to(
      sealLeftRef.current,
      { x: -34, y: -20, rotate: -28, opacity: 0, duration: 0.9, ease: "power2.out" },
      T.sealBreak,
    );
    tl.to(
      sealRightRef.current,
      { x: 34, y: -20, rotate: 28, opacity: 0, duration: 0.9, ease: "power2.out" },
      T.sealBreak,
    );
    tl.to([sealGlowRef.current, sealFlareRef.current], { opacity: 0, duration: 0.8 }, T.sealBreak + 0.15);
    if (ribbonBandRef.current) {
      tl.to(ribbonBandRef.current, { scaleY: 0, opacity: 0, duration: 0.5, ease: "power2.in" }, 1.0);
    }
    tl.to(
      tails,
      {
        y: 34,
        rotate: (i) => (i === 0 ? "+=16" : "-=16"),
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
      },
      1.0,
    );
    burstDust(
      dust.filter((_, i) => i % 2 === 0),
      T.sealBreak,
      vmin * 0.02,
      vmin * 0.3,
      1.1,
    );
    bloomStars(T.sealBreak, 0.85, vmin * 0.42);

    tl.to(shadow, { opacity: 0.25, duration: 0.8 }, T.unroll);
    tl.to(sheetShadow, { opacity: 1, duration: 0.6 }, T.unroll);
    // Rolled core yields to the invitation sheet growing between the two rods.
    if (rolledCoreRef.current) {
      tl.to(
        rolledCoreRef.current,
        { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, duration: 0.45, ease: "power1.in" },
        T.unroll,
      );
    }
    tl.to(sheet, { height: openHeight, duration: 1.7, ease: "power2.inOut" }, T.unroll);
    if (haloRef.current) {
      tl.fromTo(
        haloRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1.1, duration: 1.4, ease: "power2.out" },
        1.6,
      );
    }
    tl.to(
      [rollTopRef.current, rollBottomRef.current],
      { opacity: 0, scaleY: 0.6, duration: 0.55, ease: "power1.in" },
      2.75,
    );
    tl.set(sheet, { height: "auto" }, T.text);

    // 3 – 5s: the invitation is read.
    lines.forEach((line, i) => {
      tl.to(line, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, T.text + i * 0.2);
    });
    tl.to(scroll, { scale: 1.04, duration: 2, ease: "sine.inOut" }, T.text);

    // Card → star particles → slow fade into the website.
    const body = sheetBodyRef.current ?? sheet;
    const sheetRect = body.getBoundingClientRect();
    const scrollRect = scroll.getBoundingClientRect();
    const sheetCx = sheetRect.left + sheetRect.width / 2 - (scrollRect.left + scrollRect.width / 2);
    const sheetCy = sheetRect.top + sheetRect.height / 2 - (scrollRect.top + scrollRect.height / 2);
    const sheetW = sheetRect.width;
    const sheetH = sheetRect.height;

    // Seed stars across the card face so the parchment can "become" them.
    stars.forEach((el, i) => {
      const u = (i * 0.6180339887) % 1;
      const v = (i * 0.3819660113 + 0.13) % 1;
      tl.set(
        el,
        {
          left: "50%",
          top: "50%",
          x: sheetCx + (u - 0.5) * sheetW * 0.92,
          y: sheetCy + (v - 0.5) * sheetH * 0.88,
          opacity: 0,
          scale: 0.25 + (i % 4) * 0.12,
          rotate: 0,
        },
        T.dissolve - 0.2,
      );
    });

    // Stars slowly appear over the card.
    tl.to(
      stars,
      {
        opacity: 0.95,
        scale: 1.15,
        duration: 1.4,
        stagger: { each: 0.02, from: "center" },
        ease: "power2.out",
      },
      T.dissolve,
    );

    // Card softens into light, then vanishes — leaving only stars.
    if (sheetGlowRef.current) {
      tl.to(sheetGlowRef.current, { opacity: 0.85, duration: 1.1, ease: "power2.out" }, T.dissolve + 0.35);
    }
    tl.to(sheetShadow, { opacity: 0, duration: 0.7 }, T.dissolve + 0.4);
    tl.to(shadow, { opacity: 0, duration: 0.7 }, T.dissolve + 0.4);
    tl.to(
      [sheet, ...(haloRef.current ? [haloRef.current] : [])],
      { opacity: 0, duration: 1.6, ease: "power2.inOut" },
      T.dissolve + 0.7,
    );
    if (sheetGlowRef.current) {
      tl.to(sheetGlowRef.current, { opacity: 0, duration: 0.9, ease: "power1.in" }, T.dissolve + 1.5);
    }
    tl.to(blurLayer, { opacity: 0, duration: 1.6, ease: "power1.inOut" }, T.dissolve + 0.6);
    tl.to(scrim, { opacity: 0.15, duration: 1.8 }, T.dissolve + 0.6);
    tl.to(camera, { scale: 1, duration: 3.2, ease: "power2.out" }, T.dissolve);
    tl.to(
      lanterns,
      {
        y: `-=${vh * 0.2}`,
        opacity: 0.85,
        duration: 3.2,
        ease: "sine.out",
        stagger: { each: 0.04, from: "random" },
      },
      T.dissolve + 0.4,
    );

    // Stars drift gently, then slowly fade as the website comes through.
    stars.forEach((el, i) => {
      const angle = Number(el.dataset.angle);
      const drift = vmax * (0.18 + (i % 6) * 0.04);
      tl.to(
        el,
        {
          x: `+=${Math.cos(angle) * drift}`,
          y: `+=${Math.sin(angle) * drift - drift * 0.2}`,
          duration: 2.8,
          ease: "sine.out",
        },
        T.dissolve + 1.3,
      );
    });

    tl.call(() => setSkippable(false), undefined, T.skipTo);
    tl.call(() => onRevealStart?.(), undefined, T.reveal);

    // Soft full-scene fade (no hard radial cut) into the website.
    tl.to(stars, { opacity: 0, scale: 0.4, duration: 2.2, ease: "power1.inOut", stagger: 0.01 }, T.reveal);
    tl.to(lanterns, { opacity: 0, duration: 2.0, ease: "power1.inOut" }, T.reveal + 0.15);
    tl.to(root, { opacity: 0, duration: 2.4, ease: "power2.inOut" }, T.reveal + 0.1);
    burstDust(
      dust.filter((_, i) => i % 2 === 0),
      T.reveal + 0.2,
      vmin * 0.05,
      vmax * 0.45,
      1.6,
    );
    tl.set({}, {}, T.opened);
  });

  function openInvitation() {
    if (!ready || openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    setSkippable(!reduceMotion);
    onOpenStart?.();
    playOpening();
  }

  function skipIntro() {
    const tl = openTlRef.current;
    if (!tl || tl.time() >= T.skipTo) return;
    setSkippable(false);
    tl.seek(T.skipTo, false);
  }

  const dust = React.useMemo(
    () =>
      Array.from({ length: budget.dust }, (_, i) => ({
        id: i,
        angle: (i / budget.dust) * Math.PI * 2 + ((i * 7) % 5) * 0.09,
        fleck: i % 4 === 0,
        size: i % 4 === 0 ? 4 + (i % 3) * 1.5 : 1.8 + (i % 5) * 0.9,
      })),
    [budget.dust],
  );

  return (
    <div ref={rootRef} className="relative h-full min-h-[100svh]">
      <section
        ref={veilRef}
        className="relative flex h-full min-h-[100svh] items-center justify-center overflow-hidden bg-[#1d1a33] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]"
      >
        <div ref={sceneRef} className="absolute inset-0">
          <IntroCastleScene lanternCount={budget.lanterns} />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center gap-5 sm:gap-0 motion-reduce:gap-6">
          <div
            ref={scrollRef}
            className="relative flex min-h-[min(20rem,52svh)] w-[min(92vw,40rem)] items-center justify-center sm:min-h-[23rem]"
          >
            <span
              ref={haloRef}
              aria-hidden
              className="pointer-events-none absolute -inset-16 rounded-[40%] opacity-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,222,150,0.5) 0%, rgba(232,190,112,0.24) 45%, transparent 72%)",
              }}
            />
            <span
              aria-hidden
              data-scroll-shadow
              className="pointer-events-none absolute left-[10%] top-1/2 z-0 block h-10 w-[80%] -translate-y-1/2 rounded-[50%] bg-black/60 blur-2xl"
            />

            {/*
              Closed: top rod + rolled core + bottom rod (a real scroll).
              Opening: core collapses, invitation sheet grows between the rods only.
            */}
            <div className="relative z-10 w-full">
              <ScrollRoll ref={rollTopRef} position="top" />

              <span
                ref={rolledCoreRef}
                aria-hidden
                data-rolled-core
                className="relative z-[15] mx-[2%] -mt-px -mb-px block h-4 overflow-hidden rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_10px_rgba(0,0,0,0.35)] sm:h-5"
                style={{ backgroundImage: rollGradient }}
              >
                <span
                  className="absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(180deg, transparent 0 3px, rgba(110,82,48,0.14) 3px 4px)",
                  }}
                />
              </span>

              <div
                ref={sheetRef}
                className="relative mx-[3%] overflow-hidden motion-reduce:h-auto"
                style={{ height: 0 }}
              >
                <div ref={sheetBodyRef} className="relative">
                  <span
                    aria-hidden
                    data-sheet-shadow
                    className="pointer-events-none absolute inset-0 opacity-0 shadow-[0_26px_60px_rgba(0,0,0,0.5)]"
                  />
                  <SheetFace guestName={guestName} coupleNames={coupleNames} dateLabel={dateLabel} />
                  <span
                    ref={sheetGlowRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20 opacity-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(ellipse 70% 60% at 50% 50%, #FFF8E8 0%, rgba(255,230,170,0.92) 42%, rgba(255,214,140,0.55) 68%, transparent 85%)",
                    }}
                  />
                </div>
              </div>

              <ScrollRoll ref={rollBottomRef} position="bottom" />

              {/* Seal sits on the closed cylinder. */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 items-center justify-center">
                <span
                  ref={ribbonBandRef}
                  aria-hidden
                  className="absolute left-[calc(50%-0.875rem)] top-[calc(50%-1.5rem)] h-12 w-7 shadow-[0_2px_6px_rgba(0,0,0,0.35)] sm:left-[calc(50%-1.125rem)] sm:top-[calc(50%-1.75rem)] sm:h-14 sm:w-9"
                  style={{ backgroundImage: ribbonGradient }}
                />
                <RibbonTail side="left" />
                <RibbonTail side="right" />
                <div ref={sealRef} className="relative flex items-center justify-center">
                  <span
                    ref={sealGlowRef}
                    aria-hidden
                    className="absolute left-[calc(50%-3rem)] top-[calc(50%-3rem)] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,214,150,0.6),transparent_68%)]"
                  />
                  <span
                    ref={sealFlareRef}
                    aria-hidden
                    className="absolute left-[calc(50%-5rem)] top-[calc(50%-5rem)] h-40 w-40 rounded-full opacity-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255,226,150,0.95) 0%, rgba(232,186,104,0.6) 30%, rgba(221,171,96,0.22) 52%, transparent 70%)",
                    }}
                  />
                  <span className="relative block h-12 w-12 sm:h-16 sm:w-16">
                    <span
                      ref={sealLeftRef}
                      className="absolute inset-0"
                      style={{ clipPath: "polygon(0 0, 54% 0, 44% 38%, 56% 62%, 46% 100%, 0 100%)" }}
                    >
                      <WaxSeal monogram={monogram} />
                    </span>
                    <span
                      ref={sealRightRef}
                      className="absolute inset-0"
                      style={{
                        clipPath: "polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 56% 62%, 44% 38%)",
                      }}
                    >
                      <WaxSeal monogram={monogram} />
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-[-10%] z-30 sm:inset-[-22%]"
            >
              <MagicalStars count={budget.stars} />
            </div>
          </div>

          <div
            ref={ctaRef}
            className={cn(
              "relative z-30 flex flex-col items-center gap-2.5 text-center",
              "sm:absolute sm:inset-x-0 sm:top-[calc(50%+5rem)] sm:gap-3",
              "motion-reduce:relative motion-reduce:inset-auto motion-reduce:sm:top-auto",
            )}
          >
            <p className={cn(smallCaps, "text-[#E8D4A8]/85")}>
              Hand delivered for
            </p>
            <p
              className={cn(
                displayFont,
                "-mt-1 max-w-[min(80vw,22rem)] text-balance text-xl italic leading-snug text-[#FFF4DC] line-clamp-2 sm:max-w-[80vw] sm:text-2xl",
              )}
            >
              {guestName}
            </p>
            <button
              type="button"
              onClick={openInvitation}
              disabled={!ready || opening}
              aria-label={`Open Invitation, ${guestName}`}
              className={cn(
                displayFont,
                "mt-1 min-h-11 rounded-sm border border-[#E8D4A8] bg-[#1d1a33]/78 px-7 py-2.5 text-lg italic text-[#FFFDF8] shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-[3px] transition-colors",
                "hover:border-[#F3E7D3] hover:bg-[#DDBF8D]/28 hover:text-[#FFFDF8]",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E8D4A8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#1d1a33]",
                "disabled:cursor-wait disabled:opacity-50",
              )}
            >
              Open Invitation
            </button>
          </div>
        </div>
      </section>

      <div aria-hidden className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
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

      <button
        type="button"
        onClick={skipIntro}
        tabIndex={skippable ? 0 : -1}
        aria-hidden={!skippable}
        className={cn(
          smallCaps,
          "absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 min-h-11 px-3 text-[#F3E7D3]/80 transition-opacity duration-500 hover:text-[#FBE7BE] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] sm:right-8 sm:top-6",
          skippable ? "opacity-100 delay-150" : "pointer-events-none opacity-0",
        )}
      >
        Skip
      </button>
    </div>
  );
}

function SheetFace({
  guestName,
  coupleNames,
  dateLabel,
}: {
  guestName: string;
  coupleNames: string;
  dateLabel: string | null;
}) {
  return (
    <div
      className="relative min-h-[min(18rem,50svh)] w-full overflow-hidden sm:min-h-[20rem]"
      style={{
        backgroundImage: parchmentBackground,
        boxShadow: "inset 0 0 50px rgba(139,98,48,0.18), inset 0 1px 0 rgba(255,255,255,0.35)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(120,80,40,0.18), transparent 12%, transparent 88%, rgba(120,80,40,0.18))",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: grainOverlay }}
      />
      <span aria-hidden className="absolute inset-2.5 border border-[#C9A66B]/45 sm:inset-3" />
      <span aria-hidden className="absolute inset-4 border border-[#C9A66B]/20 sm:inset-[1.125rem]" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center sm:px-12">
        <span data-sheet-line className="block">
          <Fleuron className="w-24 text-[#C9A66B] sm:w-28" />
        </span>
        <span
          data-sheet-line
          className={cn(smallCaps, "mt-3 block max-w-full truncate text-[#9b7b62] sm:mt-4")}
        >
          For {guestName}
        </span>
        <span
          data-sheet-line
          className={cn(
            displayFont,
            "mt-3 block text-base italic text-[#5c4038] sm:mt-4 sm:text-xl",
          )}
        >
          You are cordially invited
        </span>
        <span
          data-sheet-line
          className={cn(
            scriptFont,
            "mt-1 block max-w-full text-balance text-[clamp(2.3rem,10vw,4.25rem)] leading-[1.05] text-[#6b3440]",
          )}
        >
          {coupleNames}
        </span>
        <span data-sheet-line className="mt-2 block sm:mt-3">
          <GoldDivider />
        </span>
        <span
          data-sheet-line
          className={cn(
            displayFont,
            "mt-2 block text-base italic text-[#5c4038] sm:mt-3 sm:text-lg",
          )}
        >
          Together, forever.
        </span>
        {dateLabel && (
          <span data-sheet-line className={cn(smallCaps, "mt-3 block text-[#9b7b62] sm:mt-4")}>
            {dateLabel}
          </span>
        )}
      </div>
    </div>
  );
}

const ScrollRoll = React.forwardRef<
  HTMLDivElement,
  { position: "top" | "bottom"; style?: React.CSSProperties }
>(function ScrollRoll({ position, style }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden
        data-roll={position}
        className={cn(
          "relative z-20 -mx-[1%] h-9 sm:h-11",
          position === "top" ? "-mb-0.5" : "-mt-0.5",
        )}
        style={style}
      >
        <span
          className="absolute inset-y-0 left-3 right-3 rounded-[10px] shadow-[0_10px_22px_rgba(0,0,0,0.5)]"
          style={{ backgroundImage: rollGradient }}
        />
        <span
          className="absolute inset-y-0 left-3 right-3 rounded-[10px] opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0 5px, rgba(110,82,48,0.12) 5px 6px)",
          }}
        />
        {(["left", "right"] as const).map((side) => (
          <span
            key={side}
            className={cn(
              "absolute -bottom-[14%] -top-[14%] w-4 rounded-[45%] shadow-[0_4px_10px_rgba(0,0,0,0.45)] sm:w-5",
              side === "left" ? "left-0" : "right-0",
            )}
            style={{ backgroundImage: capGradient }}
          >
            <span
              className={cn(
                "absolute top-[calc(50%-0.4375rem)] h-3.5 w-3.5 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.45)] sm:top-[calc(50%-0.5rem)] sm:h-4 sm:w-4",
                side === "left" ? "-left-2.5" : "-right-2.5",
              )}
              style={{ backgroundImage: finialBackground }}
            />
          </span>
        ))}
      </div>
    );
});

function RibbonTail({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden
      data-ribbon-tail
      className={cn(
        "absolute top-[calc(50%+0.75rem)] block h-14 w-5 sm:top-[calc(50%+1rem)] sm:h-16 sm:w-6",
        side === "left" ? "right-1/2" : "left-1/2",
        "[clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]",
      )}
      style={{
        backgroundImage: ribbonGradient,
        transformOrigin: side === "left" ? "100% 0%" : "0% 0%",
        transform: `rotate(${side === "left" ? 18 : -18}deg)`,
      }}
    />
  );
}

function WaxSeal({ monogram }: { monogram: string }) {
  return (
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
  );
}
