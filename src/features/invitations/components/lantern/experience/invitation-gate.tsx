"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { useExperience } from "./experience-provider";
import { StarField } from "../effects/star-field";
import { CastleSilhouette } from "../effects/castle-silhouette";
import { GoldButton } from "../ui/gold-button";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { Fireflies } from "../effects/fireflies";
import { useMounted } from "../hooks/use-mounted";
import { useIsMobile } from "../hooks/use-is-mobile";
import { useLanternContent } from "../content-context";
import { coupleNames } from "../config/wedding-defaults";

const LUXURY = [0.16, 1, 0.3, 1] as const;

/** Gold particles the scroll dissolves into when the guest opens the invitation. */
function dissolveParticle(i: number) {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const r = seed - Math.floor(seed);
  const seed2 = Math.sin(i * 78.233) * 43758.5453;
  const r2 = seed2 - Math.floor(seed2);
  const angle = r * Math.PI * 2;
  const dist = 100 + r2 * 220;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist - 80,
    size: 3 + r2 * 5,
    delay: r * 0.08,
    duration: 0.75 + r2 * 0.45,
  };
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: LUXURY } },
};

function ScrollRod({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-[-0.45rem] z-20 flex h-3.5 items-center sm:inset-x-[-0.6rem] sm:h-5 ${
        position === "top" ? "-top-1.5 sm:-top-2" : "-bottom-1.5 sm:-bottom-2"
      }`}
    >
      <span className="scroll-rod-cap h-5 w-5 shrink-0 rounded-full sm:h-7 sm:w-7" />
      <span className="scroll-rod h-full flex-1 rounded-full" />
      <span className="scroll-rod-cap h-5 w-5 shrink-0 rounded-full sm:h-7 sm:w-7" />
    </div>
  );
}

export function InvitationGate() {
  const { guestName, open, reducedMotion } = useExperience();
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const wedding = useLanternContent();

  const [unrolled, setUnrolled] = React.useState(false);
  const [dissolving, setDissolving] = React.useState(false);

  React.useEffect(() => {
    if (reducedMotion) setUnrolled(true);
  }, [reducedMotion]);

  const handleOpen = React.useCallback(() => {
    if (dissolving) return;
    if (reducedMotion) {
      open();
      return;
    }
    setDissolving(true);
    window.setTimeout(open, 280);
  }, [dissolving, reducedMotion, open]);

  const contentActive = unrolled && !dissolving;

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        background:
          "linear-gradient(175deg, #0d0720 0%, #1e0f3a 50%, #2d1b5e 100%)",
        WebkitOverflowScrolling: "touch",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.55, ease: LUXURY } }}
    >
      {/* Fixed atmosphere behind the scrollable parchment */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <StarField
          className="absolute inset-0"
          count={isMobile ? 90 : 220}
          parallaxFactor={0}
        />
        <MagicDust count={isMobile ? 8 : 14} intensity="soft" className="opacity-60" />

        <div className="lantern-glow absolute left-1/3 top-1/4 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="lantern-glow absolute right-1/4 top-2/3 h-[26vh] w-[26vh] opacity-35" />
        <div
          className="absolute left-1/2 top-1/2 h-[44vh] w-[44vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(232,130,154,0.35) 0%, transparent 65%)",
          }}
        />

        <FloatingLanterns count={isMobile ? 5 : 10} className="opacity-65" />
        <Fireflies count={isMobile ? 6 : 12} className="opacity-85" />
        <LanternReflection className="opacity-60" />
        <CastleSilhouette className="absolute bottom-0 left-1/2 w-[180%] max-w-none -translate-x-1/2 opacity-28 sm:w-[140%]" />
        <div className="scroll-vignette absolute inset-0" />
      </div>

      {/* Scrollable stage — centers when tall enough, scrolls on short phones */}
      <div className="relative z-10 flex min-h-[100svh] min-h-[100dvh] w-full items-center justify-center px-3 py-[max(1.5rem,env(safe-area-inset-top))] sm:px-5 sm:py-10">
        <motion.div
          className="relative w-full max-w-[min(100%,20.5rem)] min-[380px]:max-w-[min(100%,22rem)] sm:max-w-md"
          initial={mounted ? { opacity: 0, y: -28, scale: 0.94 } : false}
          animate={
            mounted
              ? dissolving
                ? { opacity: 0, scale: 1.04, y: -12 }
                : { opacity: 1, y: 0, scale: 1 }
              : false
          }
          transition={
            dissolving
              ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.95, ease: LUXURY, delay: 0.15 }
          }
          style={{ willChange: "transform, opacity" }}
        >
          <motion.div
            animate={
              mounted && !reducedMotion && !dissolving
                ? { y: [0, -6, 0] }
                : undefined
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          >
            <ScrollRod position="top" />

            <motion.div
              className="parchment parchment-edges relative overflow-hidden rounded-md px-5 py-8 text-center min-[380px]:px-7 min-[380px]:py-10 sm:px-11 sm:py-14"
              style={{ transformOrigin: "center", willChange: "transform" }}
              initial={mounted ? { scaleY: reducedMotion ? 1 : 0 } : false}
              animate={mounted ? { scaleY: 1 } : false}
              transition={{
                duration: reducedMotion ? 0 : 1.35,
                delay: reducedMotion ? 0 : 0.95,
                ease: LUXURY,
              }}
              onAnimationComplete={() => setUnrolled(true)}
            >
              <span
                aria-hidden
                className="parchment-grain pointer-events-none absolute inset-0 rounded-md"
              />

              <span className="pointer-events-none absolute left-2.5 top-2.5 h-6 w-6 rounded-tl-md border-l-2 border-t-2 border-[#b8860b]/50 sm:left-3 sm:top-3 sm:h-8 sm:w-8" />
              <span className="pointer-events-none absolute right-2.5 top-2.5 h-6 w-6 rounded-tr-md border-r-2 border-t-2 border-[#b8860b]/50 sm:right-3 sm:top-3 sm:h-8 sm:w-8" />
              <span className="pointer-events-none absolute bottom-2.5 left-2.5 h-6 w-6 rounded-bl-md border-b-2 border-l-2 border-[#b8860b]/50 sm:bottom-3 sm:left-3 sm:h-8 sm:w-8" />
              <span className="pointer-events-none absolute bottom-2.5 right-2.5 h-6 w-6 rounded-br-md border-b-2 border-r-2 border-[#b8860b]/50 sm:bottom-3 sm:right-3 sm:h-8 sm:w-8" />

              <motion.div
                className="relative"
                variants={container}
                initial="hidden"
                animate={contentActive ? "show" : "hidden"}
              >
                <motion.div variants={item} className="mb-3 flex justify-center sm:mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b8860b]/50 bg-[#4a3218]/10 text-[#8a5a1e] shadow-[inset_0_0_18px_rgba(120,72,28,0.25)] sm:h-14 sm:w-14">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-7 sm:w-7" fill="none">
                      <path
                        d="M12 2l2.4 5.6L20 8.6l-4 4.1.9 5.7L12 15.8 7.1 18.4 8 12.7 4 8.6l5.6-1z"
                        fill="currentColor"
                        opacity="0.85"
                      />
                    </svg>
                  </div>
                </motion.div>

                <motion.p
                  variants={item}
                  className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.36em] text-[#9c6b1a] sm:text-[10px] sm:tracking-[0.42em]"
                >
                  {wedding.invitation.eyebrow}
                </motion.p>

                <motion.h1
                  variants={item}
                  className="mt-3 font-display text-[1.85rem] font-bold leading-tight text-[#3a2410] min-[380px]:text-4xl sm:mt-4 sm:text-5xl"
                >
                  {coupleNames(wedding, "&")}
                </motion.h1>

                <motion.div
                  variants={item}
                  className="my-4 flex items-center justify-center gap-3 sm:my-6"
                >
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#b8860b]/70 sm:w-12" />
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3 text-[#b8860b] sm:h-3.5 sm:w-3.5"
                    fill="currentColor"
                  >
                    <path d="M12 2l1.6 3.8L17.5 6l-2.7 2.8L15.4 13 12 10.9 8.6 13l.6-4.2L6.5 6l3.9-.2z" />
                  </svg>
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#b8860b]/70 sm:w-12" />
                </motion.div>

                <motion.p
                  variants={item}
                  className="font-serif text-[0.92rem] leading-[1.7] text-[#4a3218]/90 sm:text-[1.02rem] sm:leading-[1.85]"
                >
                  {wedding.invitation.body}
                </motion.p>

                <motion.p
                  variants={item}
                  className="mt-4 font-display text-lg font-semibold text-[#3a2410] sm:mt-5 sm:text-xl"
                >
                  {guestName}
                </motion.p>

                <motion.div
                  variants={item}
                  className="mx-auto mt-4 max-w-xs border-y border-[#b8860b]/25 py-3 font-serif text-[#4a3218]/85 sm:mt-6 sm:py-4"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#9c6b1a] sm:text-[0.7rem] sm:tracking-[0.28em]">
                    {wedding.event.dayOfWeek}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-[#3a2410] sm:text-lg">
                    {wedding.event.dateLong}
                  </p>
                  <p className="mt-1 text-xs italic sm:text-sm">
                    {wedding.event.ceremony.time} &middot;{" "}
                    {wedding.event.ceremony.timezoneNote}
                  </p>
                  <p className="mt-1.5 text-xs sm:mt-2 sm:text-sm">
                    {wedding.event.venue.name}, {wedding.event.venue.city}
                  </p>
                </motion.div>

                <motion.div variants={item} className="mt-6 sm:mt-8">
                  <GoldButton
                    size="lg"
                    onClick={handleOpen}
                    className="h-12 px-8 text-xs sm:h-14 sm:px-10 sm:text-sm"
                  >
                    Open Invitation
                  </GoldButton>
                </motion.div>

                <motion.p
                  variants={item}
                  className="mt-3 font-sans text-[9px] uppercase tracking-[0.24em] text-[#9c6b1a]/70 sm:mt-4 sm:text-[10px] sm:tracking-[0.28em]"
                >
                  Tap to release the lanterns - music will play
                </motion.p>
              </motion.div>
            </motion.div>

            <ScrollRod position="bottom" />
          </motion.div>
        </motion.div>
      </div>

      {dissolving && !reducedMotion && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-1/2 top-1/2 z-15"
        >
          {Array.from({ length: 22 }, (_, i) => {
            const p = dissolveParticle(i);
            return (
              <motion.span
                key={i}
                className="absolute rounded-full will-change-transform"
                style={{
                  width: p.size,
                  height: p.size,
                  background:
                    "radial-gradient(circle, rgba(255,250,220,1), rgba(244,196,68,0.75) 45%, transparent 72%)",
                  boxShadow: "0 0 10px rgba(255,214,110,0.85)",
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.1, 0.15],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
