"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytale, fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { castleNightImages } from "@/features/invitations/components/fairytale/intro-castle-scene";
import { inviteFontVariables } from "@/features/invitations/components/fairytale/invite-fonts";
import { SkyLantern } from "@/features/invitations/components/fairytale/lanterns";
import { displayFont, scriptFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { fairytaleEase } from "@/features/invitations/components/fairytale/use-reveal";

export type RsvpCelebrationVariant = "accept" | "decline";

interface Props {
  variant: RsvpCelebrationVariant;
  guestName: string;
  monogram: string;
  reduceMotion: boolean;
}

const BUDGET = {
  mobile: { lanterns: 6, particles: 11 },
  desktop: { lanterns: 12, particles: 22 },
} as const;

/** Staggered rise specs; sliced by budget. Wave 0 starts ~0.7s, wave 1 ~1.6s. */
const LANTERN_SPECS = [
  { left: "8%", drift: 18, duration: 7.2, wave: 0, size: "h-16 w-12 sm:h-20 sm:w-14" },
  { left: "22%", drift: -14, duration: 8.0, wave: 0, size: "h-12 w-9 sm:h-16 sm:w-12" },
  { left: "48%", drift: 10, duration: 7.6, wave: 0, size: "h-14 w-11 sm:h-[4.5rem] sm:w-14" },
  { left: "72%", drift: -16, duration: 8.4, wave: 0, size: "h-12 w-9 sm:h-16 sm:w-12" },
  { left: "88%", drift: 12, duration: 7.0, wave: 0, size: "h-16 w-12 sm:h-20 sm:w-14" },
  { left: "15%", drift: -10, duration: 8.8, wave: 0, size: "h-10 w-8 sm:h-14 sm:w-10" },
  { left: "35%", drift: 20, duration: 7.4, wave: 1, size: "h-14 w-11 sm:h-[4.5rem] sm:w-14" },
  { left: "58%", drift: -18, duration: 8.2, wave: 1, size: "h-12 w-9 sm:h-16 sm:w-12" },
  { left: "78%", drift: 14, duration: 7.8, wave: 1, size: "h-10 w-8 sm:h-14 sm:w-10" },
  { left: "42%", drift: -8, duration: 9.0, wave: 1, size: "h-16 w-12 sm:h-20 sm:w-14" },
  { left: "5%", drift: 16, duration: 8.6, wave: 1, size: "h-12 w-9 sm:h-16 sm:w-12" },
  { left: "92%", drift: -12, duration: 7.5, wave: 1, size: "h-14 w-11 sm:h-[4.5rem] sm:w-14" },
] as const;

const PARTICLE_SPECS = [
  { left: "10%", delay: 0.9, size: 2, drift: 14, duration: 5.5 },
  { left: "18%", delay: 1.4, size: 3, drift: -10, duration: 6.2 },
  { left: "28%", delay: 1.1, size: 2, drift: 18, duration: 5.8 },
  { left: "36%", delay: 2.0, size: 2, drift: -14, duration: 6.5 },
  { left: "44%", delay: 1.6, size: 3, drift: 8, duration: 5.2 },
  { left: "52%", delay: 2.4, size: 2, drift: -16, duration: 6.8 },
  { left: "60%", delay: 1.3, size: 2, drift: 12, duration: 5.6 },
  { left: "68%", delay: 2.1, size: 3, drift: -8, duration: 6.0 },
  { left: "76%", delay: 1.8, size: 2, drift: 20, duration: 5.4 },
  { left: "84%", delay: 2.6, size: 2, drift: -12, duration: 6.4 },
  { left: "92%", delay: 1.5, size: 3, drift: 10, duration: 5.9 },
  { left: "6%", delay: 2.8, size: 2, drift: -18, duration: 6.6 },
  { left: "24%", delay: 3.0, size: 2, drift: 15, duration: 5.7 },
  { left: "40%", delay: 2.2, size: 3, drift: -6, duration: 6.1 },
  { left: "56%", delay: 3.2, size: 2, drift: 11, duration: 5.3 },
  { left: "64%", delay: 1.9, size: 2, drift: -15, duration: 6.7 },
  { left: "80%", delay: 2.5, size: 3, drift: 9, duration: 5.5 },
  { left: "14%", delay: 3.4, size: 2, drift: -11, duration: 6.3 },
  { left: "32%", delay: 2.7, size: 2, drift: 17, duration: 5.8 },
  { left: "48%", delay: 3.1, size: 3, drift: -9, duration: 6.0 },
  { left: "70%", delay: 1.7, size: 2, drift: 13, duration: 5.6 },
  { left: "88%", delay: 2.9, size: 2, drift: -13, duration: 6.4 },
] as const;

const COPY = {
  accept: {
    eyebrow: "Confirmed",
    thankYou: (name: string) => `Thank you, ${name}. Your place in our story is sealed.`,
    finale: "Until we meet beneath the lantern light.",
  },
  decline: {
    eyebrow: "With gratitude",
    thankYou: (name: string) => `Thank you, ${name}, for sharing your heart with us.`,
    finale: "Though paths diverge, you remain warmly in ours.",
  },
} as const;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}

export function RsvpCelebration({ variant, guestName, monogram, reduceMotion }: Props) {
  const isDesktop = useIsDesktop();
  const budget = isDesktop ? BUDGET.desktop : BUDGET.mobile;
  const copy = COPY[variant];
  const lanternTone = variant === "accept" ? "dusk" : "parchment";

  const lanternCount =
    variant === "decline" ? Math.max(4, Math.floor(budget.lanterns * 0.65)) : budget.lanterns;
  const particleCount =
    variant === "decline" ? Math.max(6, Math.floor(budget.particles * 0.55)) : budget.particles;

  const lanterns = LANTERN_SPECS.slice(0, lanternCount);
  const particles = PARTICLE_SPECS.slice(0, particleCount);

  const waveDelay = (wave: number) => (wave === 0 ? 0.7 : 1.6);
  const riseScale = variant === "decline" ? 1.25 : 1;

  return (
    <motion.div
      className={cn(
        inviteFontVariables,
        "fixed inset-0 z-[90] flex items-center justify-center overflow-hidden",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.25 : 0.7, ease: fairytaleEase }}
      role="status"
      aria-live="polite"
    >
      {/* Full-bleed castle night — no mid-frame seam */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0.35 : 1.2, ease: fairytaleEase }}
      >
        <picture className="absolute inset-0">
          <source media="(min-width: 640px)" srcSet={castleNightImages.desktop} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={castleNightImages.mobile}
            alt=""
            decoding="async"
            className="block h-full w-full object-cover object-[50%_42%] sm:object-[50%_40%]"
          />
        </picture>
        {/* Soft atmospheric wash — continuous, no hard horizontal cut */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              fairytaleAtmosphere.lavenderMist,
              variant === "accept"
                ? "radial-gradient(ellipse 60% 45% at 50% 58%, rgba(232,212,168,0.14), transparent 72%)"
                : "radial-gradient(ellipse 60% 45% at 50% 58%, rgba(201,184,232,0.14), transparent 72%)",
              "radial-gradient(ellipse 80% 55% at 50% 100%, rgba(12,10,28,0.55), transparent 62%)",
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,36,58,0.45), transparent 55%)",
              "linear-gradient(180deg, rgba(34,36,58,0.35) 0%, transparent 28%, transparent 62%, rgba(20,18,36,0.5) 100%)",
            ].join(", "),
          }}
        />
      </motion.div>

      {/* Atmospheric particles */}
      {!reduceMotion &&
        particles.map((particle) => (
          <motion.span
            key={`p-${particle.left}-${particle.delay}`}
            aria-hidden
            className="pointer-events-none absolute bottom-[22%] rounded-full"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              backgroundColor: fairytale.champagne,
              boxShadow: "0 0 10px 2px rgba(243,230,200,0.55)",
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{
              y: [30, -280],
              x: [0, particle.drift, particle.drift * 0.4],
              opacity: [0, 0.85, 0],
            }}
            transition={{
              duration: particle.duration + 1.2,
              delay: particle.delay,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 2.4,
            }}
          />
        ))}

      {/* Rising golden lanterns */}
      {!reduceMotion &&
        lanterns.map((lantern, index) => (
          <motion.span
            key={`lantern-${lantern.left}-${index}`}
            aria-hidden
            className="pointer-events-none absolute bottom-0 flex flex-col items-center will-change-transform"
            style={{ left: lantern.left }}
            initial={{ y: "18vh", opacity: 0, x: 0 }}
            animate={{
              y: ["18vh", "-110vh"],
              x: [0, lantern.drift * 0.7, lantern.drift * 0.25],
              opacity: [0, 0.82, 0.55, 0],
            }}
            transition={{
              y: {
                duration: lantern.duration * riseScale,
                delay: waveDelay(lantern.wave) + index * 0.1,
                ease: "linear",
                repeat: Infinity,
                repeatDelay: 1.1,
              },
              x: {
                duration: lantern.duration * riseScale,
                delay: waveDelay(lantern.wave) + index * 0.1,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1.1,
              },
              opacity: {
                duration: lantern.duration * riseScale,
                delay: waveDelay(lantern.wave) + index * 0.1,
                ease: "easeInOut",
                times: [0, 0.12, 0.7, 1],
                repeat: Infinity,
                repeatDelay: 1.1,
              },
            }}
          >
            <SkyLantern
              tone={lanternTone}
              delay={waveDelay(lantern.wave) + index * 0.12}
              reduceMotion={reduceMotion}
              className={cn(lantern.size, "opacity-85")}
            />
          </motion.span>
        ))}

      {/* Soft edge vignette only — no center circular blotch */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 58% at 50% 42%, transparent 55%, rgba(12,10,24,0.45) 100%)",
        }}
      />

      {/* Emblem + messages — Cormorant / Pinyon via invite font variables on portal root */}
      <div className="relative z-10 mx-6 flex max-w-lg flex-col items-center px-5 py-10 text-center sm:px-8">
        <motion.div
          className="relative"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.35 : 1.0,
            ease: fairytaleEase,
            delay: reduceMotion ? 0 : 2.8,
          }}
        >
          <p
            className={cn(scriptFont, "relative text-5xl leading-none sm:text-6xl")}
            style={{
              color: fairytale.champagne,
              textShadow:
                "0 2px 4px rgba(8,6,18,0.9), 0 0 24px rgba(8,6,18,0.75), 0 0 36px rgba(232,212,168,0.35)",
            }}
          >
            {monogram}
          </p>
        </motion.div>

        <motion.p
          className={cn(smallCaps, displayFont, "relative mt-8 font-medium")}
          style={{
            color: fairytale.gold,
            textShadow: "0 1px 3px rgba(8,6,18,0.95), 0 0 16px rgba(8,6,18,0.7)",
          }}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.3 : 0.8,
            ease: fairytaleEase,
            delay: reduceMotion ? 0.05 : 3.5,
          }}
        >
          {copy.eyebrow}
        </motion.p>

        <motion.p
          className={cn(scriptFont, "relative mt-5 text-balance text-[2.15rem] leading-[1.2] sm:text-5xl")}
          style={{
            color: fairytale.ivory,
            textShadow:
              "0 2px 6px rgba(8,6,18,0.95), 0 0 20px rgba(8,6,18,0.85), 0 0 2px rgba(8,6,18,0.9)",
          }}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.35 : 0.9,
            ease: fairytaleEase,
            delay: reduceMotion ? 0.1 : 3.8,
          }}
        >
          {copy.thankYou(guestName)}
        </motion.p>

        <motion.p
          className={cn(displayFont, "relative mt-6 text-balance text-xl font-light italic leading-relaxed sm:text-2xl")}
          style={{
            color: "rgba(255,253,248,0.95)",
            textShadow: "0 2px 5px rgba(8,6,18,0.95), 0 0 18px rgba(8,6,18,0.8)",
          }}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.35 : 0.95,
            ease: fairytaleEase,
            delay: reduceMotion ? 0.15 : 5.2,
          }}
        >
          {copy.finale}
        </motion.p>
      </div>
    </motion.div>
  );
}
