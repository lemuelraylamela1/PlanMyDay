"use client";

import * as React from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { StarField } from "../effects/star-field";
import { HillSilhouette } from "../effects/hill-silhouette";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { CastleSilhouette } from "../effects/castle-silhouette";
import { GoldButton } from "../ui/gold-button";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { useMounted } from "../hooks/use-mounted";
import { useIsMobile } from "../hooks/use-is-mobile";
import { useExperience } from "../experience/experience-provider";
import { useLanternContent } from "../content-context";
import { coupleNames } from "../config/wedding-defaults";

export function Hero() {
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const { phase } = useExperience();
  const revealed = phase === "revealed";
  const wedding = useLanternContent();
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const skyY       = useTransform(scrollYProgress, [0, 1], ["0%",   isMobile ? "18%" : "30%"]);
  const hillsY     = useTransform(scrollYProgress, [0, 1], ["0%",   isMobile ? "8%" : "15%"]);
  const castleY    = useTransform(scrollYProgress, [0, 1], ["0%",   isMobile ? "6%" : "12%"]);
  const lanternsY  = useTransform(scrollYProgress, [0, 1], ["0%",    isMobile ? "5%" : "10%"]);
  const reflectionY = useTransform(scrollYProgress, [0, 1], ["0%",   isMobile ? "10%" : "18%"]);
  const contentY   = useTransform(scrollYProgress, [0, 1], ["0%",  isMobile ? "-12%" : "-22%"]);
  const contentOp  = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex h-[100vh] h-[100svh] h-[100dvh] w-full shrink-0 items-center justify-center overflow-hidden px-0 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)]"
    >
      <StarField
        className="absolute inset-0 z-0"
        count={isMobile ? 120 : 340}
        parallaxFactor={isMobile ? 0.04 : 0.12}
      />
      <MagicDust count={isMobile ? 12 : 30} intensity="soft" className="z-[1] opacity-60" />

      <motion.div
        style={{ y: skyY }}
        className="absolute inset-0 -top-[10%] z-[1] h-[120%]"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0d0720 0%, #1e0f3a 35%, #2d1b5e 60%, #3a1f40 75%, #5c2a3a 88%, #7a3040 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[40%]"
          style={{
            background:
              "linear-gradient(0deg, rgba(244,196,68,0.18) 0%, rgba(200,100,60,0.12) 40%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[35vh] w-[55vw] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(244,196,68,0.22) 0%, rgba(200,80,100,0.12) 45%, transparent 70%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[44%] h-[52vh] w-[52vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,223,112,0.28), rgba(232,130,154,0.16) 42%, transparent 70%)",
          }}
        />
      </motion.div>

      <motion.div style={{ y: hillsY }} className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]" aria-hidden>
        <HillSilhouette className="w-full" />
      </motion.div>

      <motion.div style={{ y: castleY }} className="pointer-events-none absolute inset-x-0 bottom-0 z-[3]" aria-hidden>
        <CastleSilhouette className="w-full" />
      </motion.div>

      <motion.div style={{ y: lanternsY }} className="pointer-events-none absolute inset-0 z-[4]" aria-hidden>
        <FloatingLanterns count={isMobile ? 8 : 22} intensity="festival" />
      </motion.div>

      <motion.div style={{ y: reflectionY }} className="pointer-events-none absolute inset-x-0 bottom-0 z-[4]" aria-hidden>
        <LanternReflection className="opacity-80" />
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-36 bg-gradient-to-t from-night/75 via-night/25 to-transparent"
      />

      <AnimatePresence>
        {mounted && revealed && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[4]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            <motion.div
              className="absolute left-1/2 top-[42%] h-[42vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,247,210,0.34), rgba(244,196,68,0.16) 42%, rgba(232,130,154,0.1) 62%, transparent 75%)",
              }}
              initial={{ scale: 0.74, opacity: 0.9 }}
              animate={{ scale: 1.28, opacity: 0 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute left-1/2 top-[46%] h-px w-[min(80vw,42rem)] -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,250,220,0.92), rgba(244,196,68,0.58), transparent)",
                boxShadow: "0 0 28px rgba(244,196,68,0.5)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="relative z-[5] mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        <motion.p
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.32em] text-blush/90 sm:text-[10px] sm:tracking-[0.45em]"
        >
          {wedding.hero.eyebrow}
        </motion.p>

        <motion.h1
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          className="mt-4 text-gold-foil font-display text-[2.55rem] font-light leading-[0.98] tracking-[-0.02em] min-[380px]:text-[3rem] sm:mt-6 sm:text-7xl lg:text-8xl"
          style={{ textShadow: "0 16px 54px rgba(0,0,0,0.42)" }}
        >
          {coupleNames(wedding, "\u2661")}
        </motion.h1>

        <motion.div
          initial={false}
          animate={mounted ? { opacity: 1, scaleX: 1 } : false}
          transition={{ duration: 1, delay: 0.7 }}
          className="mx-auto my-5 rose-rule w-28 sm:my-7 sm:w-40"
        />

        <motion.p
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-serif text-lg italic text-blush/95 sm:text-2xl"
        >
          {wedding.event.dateLong.toLowerCase().startsWith(wedding.event.dayOfWeek.toLowerCase())
            ? wedding.event.dateLong
            : `${wedding.event.dayOfWeek}, ${wedding.event.dateLong}`}
        </motion.p>

        <motion.p
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-2 font-sans text-[11px] uppercase tracking-[0.22em] text-cream/70 sm:text-sm sm:tracking-[0.3em]"
        >
          {wedding.event.venue.name} &middot; {wedding.event.venue.city}
        </motion.p>

        <motion.p
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 1, delay: 1 }}
          className="mx-auto mt-5 max-w-2xl px-1 font-serif text-[0.95rem] leading-7 text-cream/78 sm:mt-6 sm:text-lg sm:leading-8"
        >
          {wedding.hero.closing}
        </motion.p>

        <motion.div
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 1, delay: 1.05 }}
          className="mt-7 sm:mt-9"
        >
          <a href="#portrait">
            <GoldButton size="lg" className="min-h-12 w-full max-w-xs sm:w-auto">
              Enter Our Story
            </GoldButton>
          </a>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#portrait"
        aria-label="Scroll to our portrait"
        initial={false}
        animate={mounted ? { opacity: 1 } : false}
        transition={{ delay: 1.6 }}
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-[5] -translate-x-1/2 text-lantern-soft sm:bottom-8"
      >
        <motion.span
          animate={mounted ? { y: [0, 8, 0] } : false}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ChevronDown className="h-7 w-7" />
        </motion.span>
      </motion.a>
    </section>
  );
}
