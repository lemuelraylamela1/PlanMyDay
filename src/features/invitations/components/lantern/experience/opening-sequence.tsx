"use client";

import * as React from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { useExperience } from "./experience-provider";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { ParticleField } from "../effects/particle-field";
import { CastleSilhouette } from "../effects/castle-silhouette";
import { HillSilhouette } from "../effects/hill-silhouette";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { useLanternContent } from "../content-context";
import { useIsMobile } from "../hooks/use-is-mobile";
import { coupleNames } from "../config/wedding-defaults";

const CONSTELLATION_STARS = [
  { left: 50, top: 6, size: 5 },
  { left: 36, top: 14, size: 3 },
  { left: 64, top: 14, size: 3 },
  { left: 25, top: 31, size: 4 },
  { left: 75, top: 31, size: 4 },
  { left: 28, top: 50, size: 3 },
  { left: 72, top: 50, size: 3 },
  { left: 40, top: 66, size: 4 },
  { left: 60, top: 66, size: 4 },
  { left: 50, top: 82, size: 6 },
  { left: 50, top: 42, size: 4 },
  { left: 50, top: 58, size: 3 },
] as const;

export function OpeningSequence() {
  const { reveal, reducedMotion } = useExperience();
  const wedding = useLanternContent();
  const isMobile = useIsMobile();
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reducedMotion) {
      const t = window.setTimeout(reveal, 900);
      return () => window.clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      gsap.config({ force3D: true });
      const tl = gsap.timeline({ onComplete: reveal });

      gsap.set(
        [
          ".seq-title-card",
          ".seq-hero-lantern",
          ".seq-light-trail",
          ".seq-lanterns",
          ".seq-sparkles",
          ".seq-kingdom",
          ".seq-reflection",
          ".seq-flash",
          ".seq-constellation",
          ".seq-constellation-line",
          ".seq-constellation-core",
        ],
        { opacity: 0 }
      );
      gsap.set(".seq-stage", { scale: 1, force3D: true });
      gsap.set(".seq-constellation-star", { x: 0, y: 0, scale: 0.4, opacity: 0, force3D: true });
      gsap.set(".seq-hero-lantern", { y: 140, scale: 0.72, force3D: true });

      // Phase 1: the dream sky opens.
      tl.add("dreamSky", 0);
      tl.fromTo(
        ".seq-moon-glow",
        { scale: 0.62, opacity: 0.2 },
        { scale: 1, opacity: 0.82, duration: 1.5, ease: "power2.out" },
        "dreamSky"
      );

      // Phase 2: chapter card appears alone.
      tl.add("chapter", 0.22);
      tl.fromTo(
        ".seq-title-card",
        { y: 28, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
        "chapter"
      );

      tl.to(
        ".seq-title-card",
        { y: -22, opacity: 0, scale: 0.96, duration: 0.7, ease: "power2.inOut" },
        "chapter+=1.35"
      );

      // Phase 3: stars gather into a constellation.
      tl.add("starsForm", 2.1);
      tl.to(".seq-constellation", { opacity: 1, duration: 0.25 }, "starsForm");
      tl.fromTo(
        ".seq-constellation-star",
        {
          x: (index: number) => (index % 2 === 0 ? -1 : 1) * (80 + index * 7),
          y: (index: number) => (index % 3 === 0 ? -1 : 1) * (36 + index * 4),
          scale: 0.35,
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1,
          stagger: 0.04,
          ease: "power2.out",
        },
        "starsForm"
      );
      tl.to(
        ".seq-constellation-line",
        { opacity: 0.55, duration: 0.6, stagger: 0.04, ease: "power2.out" },
        "starsForm+=0.4"
      );
      tl.fromTo(
        ".seq-constellation-core",
        { scale: 0.45, opacity: 0 },
        { scale: 1, opacity: 0.88, duration: 0.65, ease: "power2.out" },
        "starsForm+=0.7"
      );
      tl.to(
        ".seq-constellation",
        { scale: 1.08, opacity: 0, duration: 0.8, ease: "power2.inOut" },
        "starsForm+=1.5"
      );

      // Phase 4: lantern rise.
      tl.add("lanternRise", 3.55);
      tl.to(
        ".seq-hero-lantern",
        { y: -24, opacity: 1, scale: 1, duration: 1.45, ease: "power1.out" },
        "lanternRise"
      );

      tl.fromTo(
        ".seq-light-trail",
        { scaleX: 0, opacity: 0, transformOrigin: "50% 100%" },
        { scaleX: 1, opacity: 1, duration: 1, ease: "power2.out" },
        "lanternRise+=0.25"
      );

      // Phase 5: the world opens.
      tl.add("worldOpen", 4.55);
      tl.fromTo(
        ".seq-lanterns",
        { opacity: 0 },
        { opacity: 1, duration: 1.1, ease: "power1.out" },
        "worldOpen"
      );

      tl.fromTo(
        ".seq-kingdom",
        { y: 36, opacity: 0, scale: 1.03 },
        { y: 0, opacity: 1, scale: 1, duration: 1.25, ease: "power2.out" },
        "worldOpen+=0.1"
      );

      tl.fromTo(
        ".seq-sparkles",
        { opacity: 0 },
        { opacity: 1, duration: 0.75, ease: "power1.out" },
        "worldOpen+=0.3"
      );

      tl.fromTo(
        ".seq-reflection",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" },
        "worldOpen+=0.4"
      );

      // Phase 6: soft camera push into the site.
      tl.add("pushReveal", 5.85);
      tl.to(
        ".seq-stage",
        { scale: 1.18, duration: 1.05, ease: "power2.inOut" },
        "pushReveal"
      );

      tl.to(
        ".seq-flash",
        { opacity: 1, duration: 0.85, ease: "power1.inOut" },
        "pushReveal+=0.2"
      );

      tl.to({}, { duration: 0.2 });
    }, root);

    return () => ctx.revert();
  }, [reducedMotion, reveal]);

  return (
    <motion.div
      ref={root}
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #070314 0%, #0d0720 38%, #1e0f3a 70%, #39205f 100%)" }} />
      <div className="seq-moon-glow pointer-events-none absolute left-1/2 top-[42%] h-[78vh] w-[78vh] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,223,112,0.55), rgba(232,130,154,0.24) 42%, transparent 70%)" }} />
      <MagicDust count={isMobile ? 10 : 22} intensity="bright" className="opacity-70" />

      <div className="seq-lanterns absolute inset-0 opacity-0">
        <FloatingLanterns count={isMobile ? 7 : 16} intensity="festival" />
      </div>
      <div className="seq-sparkles absolute inset-0 opacity-0">
        <ParticleField density={isMobile ? 0.00012 : 0.0003} />
      </div>

      <div className="seq-stage relative z-10 h-full w-full will-change-transform">
        <div className="seq-title-card absolute left-1/2 top-[max(10svh,env(safe-area-inset-top))] w-[min(90vw,34rem)] -translate-x-1/2 rounded-[1.5rem] border border-lantern/40 bg-night/55 px-4 py-5 text-center opacity-0 shadow-[0_0_80px_rgba(244,196,68,0.24)] backdrop-blur-md sm:top-[16svh] sm:rounded-[2rem] sm:px-10 sm:py-7">
          <p className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.32em] text-lantern-rose/90 sm:text-[10px] sm:tracking-[0.42em]">
            {wedding.invitation.eyebrow}
          </p>
          <p className="mt-2 text-gold-foil font-display text-[1.85rem] font-light leading-tight tracking-[-0.02em] sm:mt-4 sm:text-5xl">
            {coupleNames(wedding, "&")}
          </p>
          <p className="mt-3 font-serif text-base italic text-lantern-soft">
            {wedding.event.dateShort}
          </p>
        </div>

        <div className="seq-constellation pointer-events-none absolute left-1/2 top-[42svh] z-20 h-64 w-64 -translate-x-1/2 -translate-y-1/2 opacity-0 sm:h-80 sm:w-80">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
            <path className="seq-constellation-line" d="M50 6 L36 14 L25 31 L28 50 L40 66 L50 82 L60 66 L72 50 L75 31 L64 14 Z" fill="none" stroke="rgba(255,223,112,0.65)" strokeWidth="0.7" opacity="0" />
            <path className="seq-constellation-line" d="M50 6 L64 14 M50 42 L50 58 M40 66 L60 66" fill="none" stroke="rgba(252,232,239,0.55)" strokeWidth="0.5" opacity="0" />
          </svg>
          <div className="seq-constellation-core absolute left-1/2 top-[50%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-xl" style={{ background: "radial-gradient(circle, rgba(255,250,220,0.86), rgba(244,196,68,0.35) 42%, transparent 70%)" }} />
          {CONSTELLATION_STARS.map((star, index) => (
            <span
              key={index}
              className="seq-constellation-star absolute rounded-full opacity-0"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: "radial-gradient(circle, #fffaf0, #ffdf70 48%, transparent 72%)",
                boxShadow: "0 0 16px rgba(255,223,112,0.85)",
              }}
            />
          ))}
        </div>

        <div className="seq-hero-lantern absolute left-1/2 top-[50svh] z-20 -translate-x-1/2 opacity-0 sm:top-[48svh]">
          <div className="relative h-28 w-20 sm:h-40 sm:w-28">
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lantern/35 blur-2xl sm:h-44 sm:w-44" />
            <svg viewBox="0 0 100 140" className="relative h-full w-full drop-shadow-[0_0_28px_rgba(244,196,68,0.9)]">
              <path d="M50 8 C24 8 13 25 13 54 C13 82 22 105 35 116 L65 116 C78 105 87 82 87 54 C87 25 76 8 50 8Z" fill="url(#seqLanternBody)" stroke="#ffdf70" strokeOpacity="0.65" />
              <path d="M50 95 C44 104 45 114 50 119 C56 114 56 104 50 95Z" fill="url(#seqLanternFlame)" />
              <defs>
                <radialGradient id="seqLanternBody" cx="50%" cy="78%" r="65%">
                  <stop offset="0%" stopColor="#fffaf0" />
                  <stop offset="48%" stopColor="#ffdf70" />
                  <stop offset="100%" stopColor="#d98736" />
                </radialGradient>
                <radialGradient id="seqLanternFlame" cx="50%" cy="58%" r="58%">
                  <stop offset="0%" stopColor="#fffaf0" />
                  <stop offset="100%" stopColor="#ff9d3c" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="seq-light-trail absolute left-1/2 top-[60svh] h-32 w-[min(84vw,38rem)] -translate-x-1/2 rounded-full opacity-0 blur-xl" style={{ background: "radial-gradient(ellipse, rgba(255,247,200,0.78), rgba(244,196,68,0.3) 45%, transparent 72%)" }} />

        <div className="seq-kingdom absolute inset-x-0 bottom-0 opacity-0">
          <HillSilhouette className="absolute bottom-0 w-full opacity-75" />
          <CastleSilhouette className="absolute bottom-0 left-1/2 w-[150%] max-w-none -translate-x-1/2 opacity-85 sm:w-full" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night via-night/45 to-transparent" />
        </div>
        <div className="seq-reflection absolute inset-x-0 bottom-0 opacity-0">
          <LanternReflection />
        </div>
      </div>

      <div className="seq-flash pointer-events-none absolute inset-0 opacity-0" style={{ background: "linear-gradient(180deg, rgba(244,196,68,0.85) 0%, rgba(253,246,236,1) 100%)" }} />
    </motion.div>
  );
}
