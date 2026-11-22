"use client";

import * as React from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import LanternSky from "../effects/LanternSky";
import { HillSilhouette } from "../effects/hill-silhouette";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { CastleSilhouette } from "../effects/castle-silhouette";
import { StoryCta } from "../ui/story-cta";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { useMounted } from "../hooks/use-mounted";
import { scrollToSection } from "../hooks/scroll-to-section";
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
  // Hero chrome first; lanterns wait until the opening overlay has cleared
  // and layout is settled so they fade in once instead of snapping mid-handoff.
  const [lanternsReady, setLanternsReady] = React.useState(false);
  const [decorReady, setDecorReady] = React.useState(false);
  // Latch phone layout once from the live media query — context `compact`
  // starts false before the perf provider publishes and must not remount the sky.
  const phoneRef = React.useRef<boolean | null>(null);
  if (phoneRef.current === null) {
    phoneRef.current =
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 639px)").matches
        : compact;
  }
  const onPhone = phoneRef.current;

  React.useEffect(() => {
    if (phase !== "revealed") {
      setLanternsReady(false);
      setDecorReady(false);
      return;
    }
    const phone = phoneRef.current;
    // Phones skip WebGL — bring CSS lanterns in quickly once the overlay is gone.
    const lanternId = window.setTimeout(
      () => setLanternsReady(true),
      phone ? 280 : 500,
    );
    const decorId = window.setTimeout(
      () => setDecorReady(true),
      phone ? 700 : 700,
    );
    return () => {
      window.clearTimeout(lanternId);
      window.clearTimeout(decorId);
    };
  }, [phase]);
  const lanternFade = reduceMotion
    ? { duration: 0 }
    : { duration: onPhone ? 0.7 : 1, ease: [0.22, 1, 0.36, 1] as const };
  const wedding = useLanternContent();
  const [firstRole, secondRole] = wedding.couple.order;
  const firstName = wedding.couple[firstRole].first;
  const secondName = wedding.couple[secondRole].first;
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Phones: light parallax only — scroll-linked transforms + WebGL was freezing
  // Messenger / Android WebViews right as the hero appeared.
  const p = reduceMotion || onPhone ? 0 : profile.parallax;
  const castleP = reduceMotion || onPhone ? 0 : Math.max(p, 0.55);
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", `${30 * p}%`]);
  const hillsY = useTransform(scrollYProgress, [0, 1], ["0%", `${14 * p}%`]);
  const castleY = useTransform(scrollYProgress, [0, 1], ["0%", `${42 * castleP}%`]);
  const castleScale = useTransform(scrollYProgress, [0, 1], [1, 1 + 0.14 * castleP]);
  const castleOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, reduceMotion ? 1 : 0.7]);
  const lanternsY = useTransform(scrollYProgress, [0, 1], ["0%", `${18 * p}%`]);
  const reflectionY = useTransform(scrollYProgress, [0, 1], ["0%", `${24 * p}%`]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", `${-22 * p}%`]);
  // Phones keep hero copy fully opaque — scroll-linked fade + foil clip made
  // names/CTA vanish in Messenger while the eyebrow (solid blush) stayed.
  const contentOp = useTransform(
    scrollYProgress,
    [0, 0.55],
    onPhone || reduceMotion ? [1, 1] : [1, 0],
  );

  // Desktop-only WebGL budget. Phones use CSS lanterns — compiling this shader
  // on Messenger was locking the main thread after Open Invitation.
  type SkyLock = {
    density: number;
    layers: number;
    dpr: number;
    glow: number;
    size: number;
  };
  const skyLockRef = React.useRef<SkyLock | null>(null);
  if (phase !== "revealed") {
    skyLockRef.current = null;
  } else if (!onPhone && !skyLockRef.current) {
    const q = quality === "high" ? "high" : quality === "balanced" ? "balanced" : "low";
    skyLockRef.current = {
      density: q === "high" ? 0.95 : q === "balanced" ? 0.75 : 0.5,
      layers: q === "high" ? 4 : q === "balanced" ? 3 : 2,
      dpr: profile.maxDpr,
      glow: 0.55,
      size: 0.38,
    };
  }
  const sky = skyLockRef.current ?? {
    density: 0.75,
    layers: 3,
    dpr: profile.maxDpr,
    glow: 0.55,
    size: 0.38,
  };
  // Lock phone SVG count so FPS quality dips cannot remount lanterns mid-view.
  const phoneLanternLock = React.useRef<number | null>(null);
  if (onPhone && phoneLanternLock.current == null) {
    // Enough to fill the sky without remounting when FPS quality dips.
    phoneLanternLock.current = 8;
  }
  const svgLanternCount = onPhone
    ? (phoneLanternLock.current ?? 8)
    : quality === "high"
      ? 12
      : quality === "balanced"
        ? 9
        : 6;
  const [storyVeil, setStoryVeil] = React.useState(0);
  const storyBusy = React.useRef(false);

  const enterStory = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.preventDefault();
      if (storyBusy.current) return;
      storyBusy.current = true;

      const duration = reduceMotion ? 0 : compact ? 2000 : 2400;
      scrollToSection("portrait", {
        duration,
        onProgress: (progress) => {
          // Soft night veil peaks mid-journey, then clears as portrait arrives.
          const veil = Math.sin(progress * Math.PI) * (reduceMotion ? 0 : 0.55);
          setStoryVeil(veil);
        },
        onComplete: () => {
          setStoryVeil(0);
          storyBusy.current = false;
          if (typeof window !== "undefined" && window.location.hash !== "#portrait") {
            window.history.replaceState(null, "", "#portrait");
          }
        },
      });
    },
    [compact, reduceMotion],
  );

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex w-full shrink-0 flex-col overflow-hidden px-0"
      style={{
        background: "#0d0720",
        // Live visual-viewport height on phones avoids a white strip under the
        // night sky when Messenger / browser chrome resizes the frame.
        minHeight: onPhone ? "var(--invite-vvh, 100dvh)" : "100svh",
        height: onPhone ? "var(--invite-vvh, 100dvh)" : "100dvh",
      }}
    >
      {!onPhone && decorReady ? (
        <MagicDust count={30} intensity="soft" className="z-[2] opacity-40" />
      ) : null}

      <motion.div
        style={{ y: skyY }}
        className="pointer-events-none absolute inset-0 -top-[10%] z-[1] h-[120%] overflow-hidden"
        aria-hidden
      >
        {/* Desktop only — phone WebGL compile froze Messenger right after reveal. */}
        {!onPhone && revealed && lanternsReady ? (
          <LanternSky
            lanternColors={LANTERN_SKY_COLORS}
            density={sky.density}
            layers={sky.layers}
            glowIntensity={sky.glow}
            lanternSize={sky.size}
            twinkleIntensity={0.22}
            speed={0.95}
            mouseRepulsion={false}
            mouseInteraction={false}
            intro={false}
            reveal={lanternsReady}
            disableAnimation={reduceMotion}
            transparent={false}
            backgroundColor="#0d0720"
            opacity={1}
            dpr={sky.dpr}
          />
        ) : null}
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
          className="absolute left-1/2 top-[38%] h-[48vh] w-[48vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 sm:top-[44%] sm:h-[52vh] sm:w-[52vh] sm:opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(255,223,112,0.22), rgba(232,130,154,0.12) 42%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Scenic base — taller on phones to fill the lower band */}
      <motion.div
        style={{ y: hillsY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
        aria-hidden
      >
        <HillSilhouette className="h-[28vh] w-full max-sm:opacity-95 sm:h-auto sm:min-h-0" />
      </motion.div>

      <motion.div
        style={{ y: castleY, scale: castleScale, opacity: castleOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] origin-bottom"
        aria-hidden
      >
        <CastleSilhouette className="h-[30vh] w-full max-sm:max-h-[34vh] sm:h-auto sm:min-h-[26vh] sm:max-h-[42vh]" />
      </motion.div>

      <motion.div
        style={{ y: lanternsY }}
        className="pointer-events-none absolute inset-0 z-[4]"
        aria-hidden
        initial={false}
        animate={{ opacity: lanternsReady ? (onPhone ? 0.7 : 0.75) : 0 }}
        transition={lanternFade}
      >
        {lanternsReady ? (
          <FloatingLanterns
            count={svgLanternCount}
            intensity="festival"
            sizeScale={onPhone ? 0.55 : 0.48}
            exactCount={onPhone}
          />
        ) : null}
      </motion.div>

      {!onPhone ? (
        <motion.div
          style={{ y: reflectionY }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[4]"
          aria-hidden
          initial={false}
          animate={{ opacity: lanternsReady ? 1 : 0 }}
          transition={lanternFade}
        >
          {lanternsReady ? <LanternReflection className="opacity-80" /> : null}
        </motion.div>
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-28 bg-gradient-to-t from-night/80 via-night/30 to-transparent sm:h-36"
      />

      <AnimatePresence>
        {mounted && decorReady && !onPhone && (
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

      {/* Phone: denser stack in the band above the castle. Desktop: parallax center. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[5] flex px-5 text-center max-sm:items-end max-sm:justify-center sm:items-center sm:justify-center"
        style={
          onPhone
            ? {
                paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
                // Sit the copy just above the taller castle / hills band.
                paddingBottom: "max(8.75rem, 31vh)",
              }
            : { y: contentY, opacity: contentOp, paddingBottom: "18vh" }
        }
      >
        <div className="pointer-events-auto relative mx-auto flex w-full max-w-md flex-col items-center sm:max-w-2xl">
          {/* Soft night scrim — keeps gold/cream type readable over roofs */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[125%] max-w-[42rem] -translate-x-1/2 -translate-y-[48%]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 42%, rgba(7,3,20,0.72) 0%, rgba(7,3,20,0.42) 42%, transparent 72%)",
            }}
          />

          <motion.p
            initial={onPhone ? false : { opacity: 0, y: 10 }}
            animate={mounted || onPhone ? { opacity: 1, y: 0 } : false}
            transition={
              onPhone
                ? { duration: 0 }
                : { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
            }
            className="w-full text-center font-cinzel text-[12px] font-semibold uppercase tracking-[0.3em] text-[#f7d4dc] min-[380px]:text-[13px] sm:tracking-[0.36em]"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,0.75)" }}
          >
            {wedding.hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={onPhone ? false : { opacity: 0, y: 12 }}
            animate={mounted || onPhone ? { opacity: 1, y: 0 } : false}
            transition={
              onPhone
                ? { duration: 0 }
                : { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }
            }
            className="mt-2.5 w-full text-center text-gold-foil font-display text-[clamp(2.75rem,12.5vw,3.75rem)] font-light leading-[0.94] tracking-[-0.02em] sm:mt-6 sm:text-7xl lg:text-8xl"
            style={
              onPhone
                ? {
                    // Force solid gold — foil clip + Motion opacity blanks out on Android WebViews.
                    background: "none",
                    WebkitBackgroundClip: "border-box",
                    backgroundClip: "border-box",
                    color: "#f0d078",
                    WebkitTextFillColor: "#f0d078",
                    textShadow:
                      "0 2px 0 rgba(7,3,20,0.55), 0 10px 28px rgba(0,0,0,0.72)",
                  }
                : {
                    textShadow:
                      "0 2px 0 rgba(7,3,20,0.55), 0 10px 28px rgba(0,0,0,0.72), 0 22px 60px rgba(0,0,0,0.55)",
                  }
            }
          >
            <span className="block text-center">{firstName}</span>
            <span
              className="mt-0.5 block text-center text-[0.5em] leading-none text-blush sm:mt-2 sm:text-[0.55em]"
              style={
                onPhone
                  ? { color: "#f0c4cc", WebkitTextFillColor: "#f0c4cc" }
                  : undefined
              }
              aria-hidden
            >
              {"\u2661"}
            </span>
            <span className="sr-only"> and </span>
            <span className="mt-0.5 block text-center sm:mt-2">{secondName}</span>
          </motion.h1>

          <motion.div
            initial={onPhone ? false : { opacity: 0, scaleX: 0.6 }}
            animate={mounted || onPhone ? { opacity: 1, scaleX: 1 } : false}
            transition={onPhone ? { duration: 0 } : { duration: 1, delay: 0.7 }}
            className="mx-auto my-2.5 rose-rule w-32 sm:my-7 sm:w-40"
          />

          <motion.p
            initial={onPhone ? false : { opacity: 0, y: 10 }}
            animate={mounted || onPhone ? { opacity: 1, y: 0 } : false}
            transition={onPhone ? { duration: 0 } : { duration: 1, delay: 0.85 }}
            className="mx-auto w-full max-w-[21rem] px-1 text-center font-serif text-[1.05rem] leading-7 text-cream sm:max-w-2xl sm:text-lg sm:leading-8"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.85), 0 8px 28px rgba(0,0,0,0.55)" }}
          >
            {wedding.hero.closing}
          </motion.p>

          <motion.div
            initial={onPhone ? false : { opacity: 0, y: 10 }}
            animate={mounted || onPhone ? { opacity: 1, y: 0 } : false}
            transition={onPhone ? { duration: 0 } : { duration: 1, delay: 1.05 }}
            className="mt-4 flex w-full max-w-[22rem] justify-center sm:mt-9 sm:max-w-none"
          >
            <StoryCta href="#portrait" onClick={enterStory} className="max-sm:!max-w-none">
              Enter Our Story
            </StoryCta>
          </motion.div>
        </div>
      </motion.div>

      {/* Soft night veil while the cinematic scroll carries into #portrait */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60]"
        style={{
          opacity: storyVeil,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(13,7,32,0.15) 0%, rgba(7,3,20,0.92) 70%)",
          transition: reduceMotion ? undefined : "opacity 80ms linear",
        }}
      />

      <motion.a
        href="#portrait"
        aria-label="Scroll to our portrait"
        onClick={enterStory}
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
