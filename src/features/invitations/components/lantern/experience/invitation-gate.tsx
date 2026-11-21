"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useExperience } from "./experience-provider";
import { StarField } from "../effects/star-field";
import { GoldButton } from "../ui/gold-button";
import { FloatingLanterns } from "../effects/floating-lanterns";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { Fireflies } from "../effects/fireflies";
import { useMounted } from "../hooks/use-mounted";
import { useInviteViewport } from "../hooks/use-is-mobile";
import { useLanternContent } from "../content-context";
import { coupleNames } from "../config/wedding-defaults";
import { cn } from "@/lib/utils";
import {
  ClosedScroll,
  OrnateFiligreeBanner,
  OrnateScrollRod,
  OrnateSideFiligree,
  OrnateWaxSeal,
} from "../ui/ornate-scroll";

const LUXURY = [0.16, 1, 0.3, 1] as const;
const UNROLL_DURATION = 1.85;

type GateStage = "sealed" | "unrolling" | "letterOpen" | "dissolving";

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

export function InvitationGate() {
  const { guestName, open, beginMusic, reducedMotion } = useExperience();
  const mounted = useMounted();
  const wedding = useLanternContent();
  const { isMobile, isCompact, isShort, height } = useInviteViewport();

  const [stage, setStage] = React.useState<GateStage>(() =>
    reducedMotion ? "letterOpen" : "sealed",
  );

  React.useEffect(() => {
    if (reducedMotion) setStage((s) => (s === "sealed" || s === "unrolling" ? "letterOpen" : s));
  }, [reducedMotion]);

  const handleOpen = React.useCallback(() => {
    if (stage !== "letterOpen") return;
    // Start ambient music unmuted in the same user gesture as the click.
    beginMusic();
    if (reducedMotion) {
      open();
      return;
    }
    setStage("dissolving");
    // Let parchment melt into night before OpeningSequence crossfades in.
    window.setTimeout(open, 980);
  }, [stage, reducedMotion, open, beginMusic]);

  const sealed = stage === "sealed";
  const unrolling = stage === "unrolling";
  const letterOpen = stage === "letterOpen";
  const dissolving = stage === "dissolving";
  const parchmentOpen = unrolling || letterOpen || dissolving || reducedMotion;
  const showClosedOverlay = sealed || unrolling;

  const letterRef = React.useRef<HTMLDivElement>(null);
  const closedRef = React.useRef<HTMLDivElement>(null);
  const [letterHeight, setLetterHeight] = React.useState(0);
  const [closedHeight, setClosedHeight] = React.useState(112);

  React.useLayoutEffect(() => {
    const el = letterRef.current;
    if (!el) return;
    const measure = () => setLetterHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [guestName, wedding.invitation.body, wedding.invitation.eyebrow, isCompact, isShort, isMobile]);

  React.useLayoutEffect(() => {
    const el = closedRef.current;
    if (!el) return;
    const measure = () => setClosedHeight(Math.max(el.offsetHeight, 96));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sealed, isCompact]);

  // Auto-unroll as soon as the gate appears — no tap or delay.
  React.useEffect(() => {
    if (stage !== "sealed") return;
    setStage(reducedMotion ? "letterOpen" : "unrolling");
  }, [stage, reducedMotion]);

  // Finish unroll on a timer — more reliable than Framer onAnimationComplete.
  React.useEffect(() => {
    if (stage !== "unrolling") return;
    const ms = reducedMotion ? 0 : UNROLL_DURATION * 1000;
    const id = window.setTimeout(() => setStage("letterOpen"), ms);
    return () => window.clearTimeout(id);
  }, [stage, reducedMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        background:
          "linear-gradient(175deg, #0d0720 0%, #1e0f3a 50%, #2d1b5e 100%)",
        WebkitOverflowScrolling: "touch",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        // Prefer live visual viewport height on mobile browsers.
        minHeight: height ? `${height}px` : undefined,
      }}
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {/* Match OpeningSequence sky during dissolve for a soft handoff. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: dissolving ? 1 : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "linear-gradient(180deg, #070314 0%, #0d0720 38%, #1e0f3a 70%, #39205f 100%)",
        }}
      />

      <div aria-hidden className="pointer-events-none fixed inset-0">
        {!dissolving ? (
          <>
            <StarField
              className="absolute inset-0"
              count={220}
              parallaxFactor={0}
              active
            />
            <MagicDust count={14} intensity="soft" className="opacity-60" active />
          </>
        ) : null}

        {/* Soft moon rises as scenery fades — bridges into OpeningSequence. */}
        <motion.div
          className="absolute left-1/2 top-[42%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,223,112,0.42), rgba(232,130,154,0.18) 42%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={
            dissolving
              ? { opacity: 0.7, scale: 1 }
              : { opacity: 0, scale: 0.85 }
          }
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Fade lantern scenery with the scroll. */}
        <motion.div
          className="absolute inset-0"
          animate={dissolving ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lantern-glow absolute left-1/3 top-1/4 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 opacity-50" />
          <div className="lantern-glow absolute right-1/4 top-2/3 h-[26vh] w-[26vh] opacity-35" />
          <div
            className="absolute left-1/2 top-1/2 h-[44vh] w-[44vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
            style={{
              background:
                "radial-gradient(circle, rgba(232,130,154,0.35) 0%, transparent 65%)",
            }}
          />

          {!dissolving ? (
            <>
              <FloatingLanterns count={10} className="opacity-65" active />
              <Fireflies count={12} className="opacity-85" active />
              <LanternReflection className="opacity-60" active />
            </>
          ) : null}
          <div className="scroll-vignette absolute inset-0" />
        </motion.div>
      </div>

      <div
        className={cn(
          "relative z-10 flex w-full items-center justify-center",
          isCompact ? "px-2.5" : isMobile ? "px-3.5" : "px-5",
          isShort
            ? "py-[max(0.85rem,env(safe-area-inset-top))]"
            : "py-[max(1.5rem,env(safe-area-inset-top))] sm:py-10",
        )}
        style={{
          minHeight: height
            ? `${height}px`
            : "100svh",
        }}
      >
        <motion.div
          className={cn(
            "relative w-full",
            isCompact
              ? "max-w-[min(100%,19.25rem)]"
              : isMobile
                ? "max-w-[min(100%,21.5rem)]"
                : "max-w-md",
          )}
          initial={mounted ? { opacity: 0, y: -28, scale: 0.94 } : false}
          animate={
            mounted
              ? dissolving
                ? { opacity: 0, scale: 1.015, y: -8 }
                : { opacity: 1, y: 0, scale: 1 }
              : false
          }
          transition={
            dissolving
              ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.95, ease: LUXURY, delay: 0.15 }
          }
          style={{ willChange: "transform, opacity" }}
        >
          <motion.div
            animate={
              mounted && !reducedMotion && letterOpen && !isShort
                ? { y: [0, -6, 0] }
                : undefined
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            <div className="relative w-full">
            {/* Closed roll: in-flow while sealed; overlays & fades while unrolling. */}
            <AnimatePresence>
              {showClosedOverlay ? (
                <motion.div
                  key="closed-scroll"
                  ref={closedRef}
                  className={cn(
                    "z-20 w-full",
                    parchmentOpen
                      ? "pointer-events-none absolute inset-x-0 top-0"
                      : "relative",
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: sealed ? 1 : 0, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: LUXURY }}
                >
                  <ClosedScroll compact={isCompact} />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.div
              className={cn(
                // Keep overflow visible so top/bottom scroll sticks aren't clipped.
                sealed
                  ? "pointer-events-none absolute inset-x-0 top-0"
                  : "relative",
              )}
              initial={false}
              animate={{
                height: parchmentOpen
                  ? Math.max(letterHeight, closedHeight)
                  : closedHeight,
                opacity: parchmentOpen ? 1 : 0,
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      height: {
                        duration: UNROLL_DURATION,
                        ease: LUXURY,
                      },
                      opacity: {
                        duration: 0.4,
                        ease: LUXURY,
                      },
                    }
              }
              style={{ overflow: "visible", willChange: "height, opacity" }}
            >
              <OrnateScrollRod position="top" />

              <div className="h-full overflow-hidden">
              <div
                ref={letterRef}
                className={cn(
                  "parchment parchment-edges ornate-scroll-body relative overflow-hidden text-center",
                  isCompact
                    ? "px-4 py-6"
                    : isShort
                      ? "px-5 py-7"
                      : isMobile
                        ? "px-6 py-8"
                        : "px-10 py-12",
                )}
              >
                <span
                  aria-hidden
                  className="parchment-grain pointer-events-none absolute inset-0"
                />
                <OrnateSideFiligree side="left" />
                <OrnateSideFiligree side="right" />

                {/* Letter is fully painted; height unroll reveals it like a real scroll. */}
                <div className="relative z-10">
                  <OrnateFiligreeBanner position="top" />

                  <div
                    className={cn(
                      "flex justify-center",
                      isShort ? "mb-2" : "mb-3 sm:mb-4",
                    )}
                  >
                    <OrnateWaxSeal
                      className={
                        isCompact ? "h-12 w-12 sm:h-16 sm:w-16" : undefined
                      }
                    />
                  </div>

                  <p
                    className={cn(
                      "font-cinzel font-semibold uppercase text-[#7a5210]",
                      isCompact
                        ? "text-[10px] tracking-[0.28em]"
                        : "text-[10px] tracking-[0.32em] sm:text-[11px] sm:tracking-[0.42em]",
                    )}
                  >
                    {wedding.invitation.eyebrow}
                  </p>

                  <h1
                    className={cn(
                      "font-display font-light leading-tight tracking-[-0.02em] text-[#3a2410]",
                      isCompact
                        ? "mt-2 text-[1.65rem]"
                        : isShort
                          ? "mt-2.5 text-[1.85rem]"
                          : "mt-3 text-[1.95rem] min-[380px]:text-4xl sm:mt-4 sm:text-5xl",
                    )}
                  >
                    {coupleNames(wedding, "&")}
                  </h1>

                  <div
                    className={cn(
                      "flex items-center justify-center gap-3",
                      isShort ? "my-3" : "my-4 sm:my-5",
                    )}
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
                  </div>

                  <p
                    className={cn(
                      "font-script leading-none text-[#3a2410]",
                      isCompact
                        ? "mt-3 text-[1.55rem]"
                        : "mt-4 text-[1.85rem] sm:mt-5 sm:text-[2.35rem]",
                    )}
                  >
                    {guestName}
                  </p>

                  <p
                    className={cn(
                      "font-serif leading-[1.7] text-[#4a3218]",
                      isCompact
                        ? "mt-2.5 text-[0.9rem]"
                        : "mt-3 text-[0.95rem] sm:mt-4 sm:text-[1.02rem] sm:leading-[1.85]",
                    )}
                  >
                    {wedding.invitation.body}
                  </p>

                  <div className={cn(isShort ? "mt-5" : "mt-7 sm:mt-9")}>
                    <GoldButton
                      size="lg"
                      onClick={handleOpen}
                      disabled={!letterOpen}
                      className={cn(
                        "text-xs sm:text-sm",
                        isCompact
                          ? "h-11 px-7"
                          : "h-12 px-8 sm:h-14 sm:px-10",
                      )}
                    >
                      Open Invitation
                    </GoldButton>
                  </div>

                  <p
                    className={cn(
                      "mx-auto max-w-[18rem] font-sans font-semibold uppercase leading-snug text-[#5c3a12]",
                      isCompact
                        ? "mt-3 px-1 text-[11px] tracking-[0.12em]"
                        : "mt-3.5 px-2 text-[11px] tracking-[0.14em] sm:mt-4 sm:max-w-none sm:text-xs sm:tracking-[0.18em]",
                    )}
                  >
                    Tap to release the lanterns — music will play
                  </p>

                  <div className={cn(isShort ? "mt-3" : "mt-5")}>
                    <OrnateFiligreeBanner position="bottom" />
                  </div>
                </div>
              </div>
              </div>

              <OrnateScrollRod position="bottom" />
            </motion.div>
            </div>
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
