"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { GoldDivider, displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay } from "@/features/invitations/components/fairytale/textures";
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
      style={{
        backgroundImage:
          "radial-gradient(ellipse 55% 40% at 50% 35%, rgba(221,191,141,0.16), transparent 72%), linear-gradient(180deg,#1d1820 0%,#241d22 48%,#16121a 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: grainOverlay }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#DDBF8D]")}>
          Counting the days
        </motion.p>
        <motion.h2
          {...reveal(0.15, 28)}
          className={cn(displayFont, "mt-5 text-balance text-4xl font-light sm:text-5xl")}
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
            className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
            aria-live="polite"
            aria-atomic="true"
          >
            {units.map((unit, index) => (
              <motion.div
                key={unit.label}
                {...reveal(0.6 + index * 0.08)}
                className="flex flex-col items-center border border-[#DDBF8D]/25 bg-[#FFFDF8]/[0.03] px-3 py-6 sm:py-8"
              >
                <span
                  className={cn(
                    displayFont,
                    "tabular-nums text-[clamp(2.4rem,8vw,3.6rem)] font-light leading-none text-[#FFFDF8]",
                  )}
                >
                  {unit.wide ? unit.value : pad(unit.value)}
                </span>
                <span className={cn(smallCaps, "mt-4 text-[9px] text-[#DDBF8D]/80")}>{unit.label}</span>
              </motion.div>
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

        <motion.a
          {...reveal(0.9, 12)}
          href="#interlude"
          className={cn(
            smallCaps,
            "mt-16 inline-flex flex-col items-center gap-3 text-[#DDBF8D]/75 transition-colors hover:text-[#DDBF8D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
          )}
        >
          Continue
          <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-[#DDBF8D]/35">
            <motion.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-[#E8B8C7]"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: fairytaleEase }}
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
