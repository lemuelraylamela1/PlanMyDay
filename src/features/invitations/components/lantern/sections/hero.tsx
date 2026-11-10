"use client";

import * as React from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import LanternSky from "../effects/LanternSky";
import { HillSilhouette } from "../effects/hill-silhouette";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { CastleSilhouette } from "../effects/castle-silhouette";
import { GoldButton } from "../ui/gold-button";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { useMounted } from "../hooks/use-mounted";
import { useExperience } from "../experience/experience-provider";
import { useLanternContent } from "../content-context";
import { useLanternPerf } from "../performance/lantern-perf-provider";

/** Warm Tangled paper-lantern palette for the WebGL sky. */
const LANTERN_SKY_COLORS = ["#fff3b0", "#ffd45a", "#f5a24a", "#e8894a"];

export function Hero() {
  const mounted = useMounted();
  const { phase } = useExperience();
  const { profile, compact, reduceMotion, quality } = useLanternPerf();
  const revealed = phase === "revealed";
  const wedding = useLanternContent();
  const [firstRole, secondRole] = wedding.couple.order;
  const firstName = wedding.couple[firstRole].first;
  const secondName = wedding.couple[secondRole].first;
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const p = reduceMotion ? 0 : profile.parallax;
  // Keep castle parallax readable even on "balanced" (p ~ 0.45); off when reduced-motion.
  const castleP = reduceMotion ? 0 : Math.max(p, 0.55);
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", `${30 * p}%`]);
  // Hills stay mid-distance; castle is nearer so it drifts farther + scales.
  const hillsY = useTransform(scrollYProgress, [0, 1], ["0%", `${14 * p}%`]);
  const castleY = useTransform(scrollYProgress, [0, 1], ["0%", `${42 * castleP}%`]);
  const castleScale = useTransform(scrollYProgress, [0, 1], [1, 1 + 0.14 * castleP]);
  const castleOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, reduceMotion ? 1 : 0.7]);
  const lanternsY = useTransform(scrollYProgress, [0, 1], ["0%", `${18 * p}%`]);
  const reflectionY = useTransform(scrollYProgress, [0, 1], ["0%", `${24 * p}%`]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", `${-22 * p}%`]);
  const contentOp = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Festive Tangled lantern sky under castle — denser on high, lighter on low.
  const skyDensity = quality === "high" ? 0.95 : quality === "balanced" ? 0.75 : 0.5;
  const skyLayers = quality === "high" ? 4 : quality === "balanced" ? 3 : 2;
  const svgLanternCount = quality === "high" ? 10 : quality === "balanced" ? 8 : 5;

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex h-[100vh] h-[100svh] h-[100dvh] w-full shrink-0 flex-col overflow-hidden px-0 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)]"
      style={{ background: "#0d0720" }}
    >
      <MagicDust count={30} intensity="soft" className="z-[2] opacity-40" />

      <motion.div
        style={{ y: skyY }}
        className="pointer-events-none absolute inset-0 -top-[10%] z-[1] h-[120%] overflow-hidden"
        aria-hidden
      >
        <LanternSky
          lanternColors={LANTERN_SKY_COLORS}
          density={skyDensity}
          layers={skyLayers}
          glowIntensity={0.65}
          lanternSize={0.7}
          twinkleIntensity={0.22}
          speed={0.95}
          mouseRepulsion={false}
          mouseInteraction={false}
          intro={!reduceMotion && revealed}
          disableAnimation={reduceMotion}
          transparent={false}
          backgroundColor="#0d0720"
          opacity={1}
          dpr={profile.maxDpr}
        />
        {/* Warm horizon twist — sunset wash over the lantern sky toward the castle */}
        <div
          className="absolute inset-x-0 bottom-0 h-[48%]"
          style={{
            background:
              "linear-gradient(0deg, rgba(122,48,64,0.55) 0%, rgba(90,42,58,0.28) 28%, rgba(200,100,60,0.12) 55%, transparent 100%)",
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
          className="absolute left-1/2 top-[10%] h-[34vh] w-[90vw] -translate-x-1/2 sm:top-[18%] sm:h-[40vh] sm:w-[70vw]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(255,223,112,0.12) 0%, rgba(232,130,154,0.08) 38%, transparent 72%)",
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
          className={`absolute left-1/2 top-[38%] h-[48vh] w-[48vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 sm:top-[44%] sm:h-[52vh] sm:w-[52vh] sm:opacity-35 ${
            profile.richFilters || !compact ? "blur-3xl" : "blur-xl"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(255,223,112,0.22), rgba(232,130,154,0.12) 42%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Scenic base — raised / taller on mobile to claim the lower third */}
      <motion.div
        style={{ y: hillsY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] sm:bottom-0"
        aria-hidden
      >
        <HillSilhouette className="h-[32vh] w-full min-[400px]:h-[34vh] sm:h-auto sm:min-h-0" />
      </motion.div>

      <motion.div
        style={{ y: castleY, scale: castleScale, opacity: castleOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-[-2%] z-[3] origin-bottom sm:bottom-0"
        aria-hidden
      >
        <CastleSilhouette className="h-[30vh] w-full min-[400px]:h-[32vh] sm:h-auto sm:min-h-[26vh] sm:max-h-[42vh]" />
      </motion.div>

      <motion.div style={{ y: lanternsY }} className="pointer-events-none absolute inset-0 z-[4] opacity-75" aria-hidden>
        <FloatingLanterns count={svgLanternCount} intensity="festival" sizeScale={0.78} />
      </motion.div>

      <motion.div style={{ y: reflectionY }} className="pointer-events-none absolute inset-x-0 bottom-0 z-[4]" aria-hidden>
        <LanternReflection className="opacity-80" />
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-28 bg-gradient-to-t from-night/80 via-night/30 to-transparent sm:h-36"
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
              className="absolute left-1/2 top-[36%] h-[42vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:top-[42%]"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,247,210,0.34), rgba(244,196,68,0.16) 42%, rgba(232,130,154,0.1) 62%, transparent 75%)",
              }}
              initial={{ scale: 0.74, opacity: 0.9 }}
              animate={{ scale: 1.28, opacity: 0 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute left-1/2 top-[40%] h-px w-[min(80vw,42rem)] -translate-x-1/2 sm:top-[46%]"
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

      {/* Content sits in the upper sky so names clear the bright castle */}
      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="absolute inset-0 z-[5] flex items-start justify-center px-5 pb-8 pt-[max(5.5rem,12vh)] text-center sm:items-center sm:pt-0 sm:pb-[18vh]"
      >
        <div className="relative mx-auto flex w-full max-w-md flex-col items-center sm:max-w-2xl">
          {/* Soft night scrim — keeps gold/cream type readable over roofs */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] max-w-[42rem] -translate-x-1/2 -translate-y-[46%]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 42%, rgba(7,3,20,0.72) 0%, rgba(7,3,20,0.42) 42%, transparent 72%)",
            }}
          />

          <motion.p
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full text-center font-cinzel text-[10px] font-semibold uppercase tracking-[0.38em] text-blush min-[380px]:text-[11px] sm:text-[10px] sm:tracking-[0.45em]"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,0.75)" }}
          >
            {wedding.hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="mt-4 w-full text-center text-gold-foil font-display text-[clamp(2.85rem,12vw,4.1rem)] font-light leading-[0.95] tracking-[-0.02em] sm:mt-6 sm:text-7xl lg:text-8xl"
            style={{
              textShadow:
                "0 2px 0 rgba(7,3,20,0.55), 0 10px 28px rgba(0,0,0,0.72), 0 22px 60px rgba(0,0,0,0.55)",
            }}
          >
            <span className="block text-center">{firstName}</span>
            <span className="mt-1 block text-center text-[0.55em] leading-none text-blush sm:mt-2" aria-hidden>
              {"\u2661"}
            </span>
            <span className="sr-only"> and </span>
            <span className="mt-1 block text-center sm:mt-2">{secondName}</span>
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
            transition={{ duration: 1, delay: 0.85 }}
            className="mx-auto w-full max-w-[20.5rem] px-1 text-center font-serif text-[1.02rem] leading-7 text-cream sm:max-w-2xl sm:text-lg sm:leading-8"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.85), 0 8px 28px rgba(0,0,0,0.55)" }}
          >
            {wedding.hero.closing}
          </motion.p>

          <motion.div
            initial={false}
            animate={mounted ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 1, delay: 1.05 }}
            className="mt-7 flex w-full justify-center sm:mt-9"
          >
            <a href="#portrait" className="inline-flex w-full max-w-xs justify-center sm:w-auto">
              <GoldButton
                size="lg"
                className="min-h-12 w-full text-[0.78rem] tracking-[0.2em] shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:min-h-14 sm:w-auto"
              >
                Enter Our Story
              </GoldButton>
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.a
        href="#portrait"
        aria-label="Scroll to our portrait"
        initial={false}
        animate={mounted ? { opacity: 1 } : false}
        transition={{ delay: 1.6 }}
        className="absolute bottom-[max(1.15rem,env(safe-area-inset-bottom))] left-1/2 z-[5] -translate-x-1/2 text-lantern-soft sm:bottom-8"
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
