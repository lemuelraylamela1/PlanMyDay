"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { GoldDivider, displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay } from "@/features/invitations/components/fairytale/textures";
import { fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
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

export function CountdownChapter({ wedding }: { wedding: InvitationWedding }) {
  const reveal = useReveal();
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
      className="relative overflow-hidden px-6 py-28 text-center text-[#F3E7D3] sm:py-36"
      style={{ backgroundImage: fairytaleAtmosphere.duskShell }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: grainOverlay }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: fairytaleAtmosphere.lavenderMist }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
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
          <motion.div
            {...reveal(0.55)}
            className="mt-14 flex w-full max-w-2xl flex-wrap items-end justify-center gap-x-4 gap-y-8 sm:gap-x-8"
            aria-live="polite"
            aria-atomic="true"
          >
            {units.map((unit, index) => (
              <React.Fragment key={unit.label}>
                {index > 0 && (
                  <span
                    aria-hidden
                    className="mb-8 hidden h-10 w-px bg-gradient-to-b from-transparent via-[#DDBF8D]/50 to-transparent sm:block"
                  />
                )}
                <motion.div
                  {...reveal(0.6 + index * 0.08)}
                  className="flex min-w-[4.5rem] flex-col items-center sm:min-w-[5.5rem]"
                >
                  <span
                    className={cn(
                      displayFont,
                      "tabular-nums text-[clamp(2.6rem,9vw,3.8rem)] font-light leading-none text-[#FFFDF8]",
                    )}
                  >
                    {unit.wide ? unit.value : pad(unit.value)}
                  </span>
                  <span className={cn(smallCaps, "mt-4 text-[9px] text-[#E8D4A8]/80")}>{unit.label}</span>
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>
        ) : (
          <motion.p
            {...reveal(0.55)}
            className={cn(displayFont, "mt-14 text-2xl italic text-[#DDBF8D]/85")}
          >
            A date to be announced
          </motion.p>
        )}

        <ChapterContinue href="#interlude" tone="dusk" className="mt-16" revealProps={reveal(0.9, 12)}>
          Continue
        </ChapterContinue>
      </div>
    </section>
  );
}
