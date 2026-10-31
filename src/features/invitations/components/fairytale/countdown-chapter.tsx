"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useParallaxY,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import {
  GoldDivider,
  countdownDisplay,
  displayFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay } from "@/features/invitations/components/fairytale/textures";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
import { SceneTransition } from "@/features/invitations/components/fairytale/scene-transition";
import type { InvitationWedding } from "@/features/invitations/components/fairytale/types";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  complete: boolean;
}

function getRemaining(targetMs: number, nowMs: number): Remaining {
  const delta = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(delta / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    complete: delta <= 0,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

const countdownPhoto =
  fairytaleMedia.prenup.find((photo) => photo.src?.includes("hero-03")) ??
  fairytaleMedia.prenup.find((photo) => Boolean(photo.src)) ??
  fairytaleMedia.hero[0];

export function CountdownChapter({ wedding }: { wedding: InvitationWedding }) {
  const reveal = useReveal();
  const reduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const progress = useChapterScroll(sectionRef);
  const imageY = useParallaxY(progress, "-6%", "7%");

  const targetMs = wedding.countdownTargetIso
    ? Date.parse(wedding.countdownTargetIso)
    : Number.NaN;
  const hasTarget = Number.isFinite(targetMs);

  const [remaining, setRemaining] = React.useState<Remaining>(() =>
    hasTarget ? getRemaining(targetMs, Date.now()) : { days: 0, hours: 0, minutes: 0, seconds: 0, complete: true },
  );

  React.useEffect(() => {
    if (!hasTarget) return;
    const tick = () => setRemaining(getRemaining(targetMs, Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [hasTarget, targetMs]);

  const units = [
    { label: "Days", value: remaining.days, wide: true },
    { label: "Hours", value: remaining.hours },
    { label: "Minutes", value: remaining.minutes },
    { label: "Seconds", value: remaining.seconds },
  ];

  return (
    <section
      id="countdown"
      ref={sectionRef}
      data-scene="countdown"
      className="relative scroll-mt-16 overflow-hidden px-5 py-20 text-center text-[#F3E7D3] sm:scroll-mt-20 sm:px-8 sm:py-36"
    >
      <div className="absolute inset-0 overflow-hidden bg-[#1a1c2e]">
        {countdownPhoto?.src && (
          <motion.div
            className="absolute inset-x-0 bottom-[-8%] top-[-8%]"
            style={reduceMotion ? undefined : { y: imageY }}
          >
            <Image
              src={countdownPhoto.src}
              alt=""
              fill
              sizes="100vw"
              quality={72}
              className="object-cover object-center opacity-35"
              aria-hidden
            />
          </motion.div>
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,28,46,0.72)_0%,rgba(34,36,58,0.78)_45%,rgba(26,28,46,0.92)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: grainOverlay }}
        />
      </div>

      <SceneTransition tone="dusk" />

      <div data-scene-content className="relative mx-auto flex max-w-3xl flex-col items-center">
        <motion.span
          aria-hidden
          className="mb-8 h-10 w-px bg-gradient-to-b from-transparent via-[#DDBF8D]/70 to-transparent"
          initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: fairytaleEase }}
        />

        <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#E8D4A8]")}>
          Counting the days
        </motion.p>
        <motion.h2
          {...reveal(0.15, 28)}
          className={cn(displayFont, "mt-5 text-balance text-4xl font-light tracking-[-0.02em] sm:text-5xl")}
        >
          {remaining.complete && hasTarget ? "Our day has arrived" : "Until we say I do"}
        </motion.h2>
        {wedding.dateLabel && (
          <motion.p {...reveal(0.28)} className={cn(smallCaps, "mt-5 text-[#DDBF8D]/75")}>
            {wedding.dateLabel}
          </motion.p>
        )}

        <motion.div {...reveal(0.4)} className="mt-10">
          <GoldDivider tone="light" />
        </motion.div>

        {hasTarget ? (
          <div
            className="mt-14 flex w-full max-w-2xl flex-wrap items-end justify-center gap-x-5 gap-y-10 sm:gap-x-10"
            aria-live="polite"
            aria-atomic="true"
          >
            {units.map((unit, index) => (
              <React.Fragment key={unit.label}>
                {index > 0 && (
                  <span
                    aria-hidden
                    className="mb-9 hidden text-2xl font-light text-[#DDBF8D]/45 sm:block"
                  >
                    ·
                  </span>
                )}
                <motion.div
                  {...reveal(0.5 + index * 0.08)}
                  className="flex min-w-[4.75rem] flex-col items-center sm:min-w-[5.75rem]"
                >
                  <CountdownValue
                    value={unit.wide ? String(unit.value) : pad(unit.value)}
                    reduceMotion={Boolean(reduceMotion)}
                  />
                  <span className={cn(smallCaps, "mt-4 text-[9px] text-[#E8D4A8]/80")}>{unit.label}</span>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <motion.p
            {...reveal(0.55)}
            className={cn(displayFont, "mt-14 text-2xl italic text-[#DDBF8D]/85")}
          >
            A date to be announced
          </motion.p>
        )}

        {(wedding.venueName || wedding.ceremonyTimeLabel) && (
          <motion.div
            {...reveal(0.75)}
            className="mt-14 flex max-w-md flex-col items-center gap-2"
          >
            {wedding.ceremonyTimeLabel && (
              <p className={cn(displayFont, "text-base italic text-[#F3E7D3]/70")}>
                Ceremony at {wedding.ceremonyTimeLabel}
              </p>
            )}
            {wedding.venueName && (
              <p className={cn(smallCaps, "text-[#E8D4A8]/65")}>{wedding.venueName}</p>
            )}
          </motion.div>
        )}

        <ChapterContinue href="#interlude" tone="dusk" className="mt-16" revealProps={reveal(0.9, 12)}>
          Continue
        </ChapterContinue>
      </div>
    </section>
  );
}

function CountdownValue({
  value,
  reduceMotion,
}: {
  value: string;
  reduceMotion: boolean;
}) {
  return (
    <span
      className={cn(
        displayFont,
        countdownDisplay,
        "relative block h-[1.05em] overflow-hidden tabular-nums text-[#FFFDF8]",
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="block"
          initial={reduceMotion ? false : { y: "32%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={reduceMotion ? undefined : { y: "-28%", opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: fairytaleEase }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
