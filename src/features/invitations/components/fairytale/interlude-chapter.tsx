"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  cinematicPerspective,
  useChapterScroll,
  useDepthLayer,
  useExitDissolve,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import { GoldDivider, displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay } from "@/features/invitations/components/fairytale/textures";

const lanterns = [
  { className: "left-[12%] top-[38%] h-64 w-64", duration: 8, depth: "far" as const },
  { className: "right-[10%] top-[48%] h-80 w-80", duration: 10, depth: "mid" as const },
  { className: "left-[46%] top-[66%] h-56 w-56", duration: 9, depth: "near" as const },
];

export function InterludeChapter() {
  const ref = React.useRef<HTMLElement>(null);
  const reveal = useReveal();
  const reduceMotion = useReducedMotion();
  const progress = useChapterScroll(ref);
  const copyLayer = useDepthLayer(progress, "foreground");
  const dissolve = useExitDissolve(progress);
  const farGlow = useDepthLayer(progress, "far");
  const midGlow = useDepthLayer(progress, "mid");
  const nearGlow = useDepthLayer(progress, "near");
  const glowByDepth = { far: farGlow, mid: midGlow, near: nearGlow };

  return (
    <section
      id="interlude"
      ref={ref}
      className="relative overflow-hidden px-6 py-48 text-center text-[#F3E7D3] sm:py-56"
      style={{
        perspective: cinematicPerspective,
        backgroundImage:
          "linear-gradient(180deg,#FBF4EA 0%,#d8c8b3 7%,#55504a 20%,#25302a 34%,#17211c 55%,#1b241f 72%,#4c4f47 84%,#d9cdbb 94%,#FBF6EE 100%)",
      }}
    >
      {lanterns.map((lantern) => {
        const layer = glowByDepth[lantern.depth];
        return (
          <motion.div
            key={lantern.className}
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(240,196,128,0.2),transparent_65%)] will-change-transform",
              lantern.className,
            )}
            style={
              reduceMotion
                ? undefined
                : {
                    y: layer.y,
                    rotateX: layer.rotateX,
                    scale: layer.scale,
                    z: layer.z,
                  }
            }
            animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
            transition={{ duration: lantern.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: grainOverlay }}
      />

      <motion.div
        className="relative mx-auto flex max-w-2xl flex-col items-center will-change-transform"
        style={
          reduceMotion
            ? undefined
            : {
                y: copyLayer.y,
                rotateX: copyLayer.rotateX,
                z: copyLayer.z,
                opacity: dissolve,
                transformStyle: "preserve-3d",
              }
        }
      >
        <BotanicalSprig />
        <motion.p {...reveal(0.2)} className={cn(smallCaps, "mt-10 text-[#DDBF8D]")}>
          An interlude
        </motion.p>
        <motion.h2
          {...reveal(0.4, 30)}
          className={cn(displayFont, "mt-6 text-balance text-4xl font-light leading-tight sm:text-6xl")}
        >
          Once upon a time,
          <span className="mt-2 block italic text-[#E8B8C7]">two hearts found their way home.</span>
        </motion.h2>
        <motion.div {...reveal(0.7)} className="mt-12">
          <GoldDivider tone="light" />
        </motion.div>
        <motion.a
          {...reveal(0.85, 12)}
          href="#rsvp"
          className={cn(
            smallCaps,
            "mt-16 inline-flex flex-col items-center gap-3 text-[#DDBF8D]/75 transition-colors hover:text-[#DDBF8D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
          )}
        >
          Continue to RSVP
          <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-[#DDBF8D]/35">
            <motion.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-[#E8B8C7]"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: fairytaleEase }}
            />
          </span>
        </motion.a>
      </motion.div>
    </section>
  );
}

const sprigPaths = [
  "M30 196C46 160 60 128 92 96S150 40 176 14",
  "M58 152c-18-4-28-18-26-32 14 2 26 14 26 32Z",
  "M74 128c4-18 18-28 32-26-2 14-14 26-32 26Z",
  "M96 98c-18-6-26-20-22-34 14 4 24 18 22 34Z",
  "M118 76c6-17 21-25 34-21-4 13-18 23-34 21Z",
  "M140 54c-16-8-22-23-17-36 13 6 21 21 17 36Z",
];

function BotanicalSprig() {
  const reduceMotion = useReducedMotion();

  return (
    <svg aria-hidden viewBox="0 0 200 210" fill="none" className="h-36 w-36 text-[#DDBF8D]/80 sm:h-44 sm:w-44">
      {sprigPaths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={index === 0 ? 1.1 : 0.8}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: index === 0 ? 1.8 : 1.1, ease: fairytaleEase, delay: index === 0 ? 0 : 0.5 + index * 0.15 }}
        />
      ))}
      <circle cx="176" cy="14" r="2.2" fill="currentColor" />
    </svg>
  );
}
