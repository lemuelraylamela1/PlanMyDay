"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytale } from "@/features/invitations/components/fairytale/fairytale-tokens";

const lanterns = [
  { className: "left-[7%]", duration: 20, delay: 0, drift: 16 },
  { className: "right-[8%]", duration: 18, delay: 4, drift: -14 },
  { className: "left-[24%] hidden sm:flex", duration: 24, delay: 8, drift: 10 },
  { className: "right-[22%] hidden md:flex", duration: 22, delay: 12, drift: -18 },
];

/** Sky lanterns that rise through the section and fade as they leave. */
export function LanternField({ tone = "parchment" }: { tone?: "dusk" | "parchment" }) {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {lanterns.map((lantern) => (
        <motion.span
          key={lantern.className}
          className={cn("absolute bottom-0 flex flex-col items-center", lantern.className)}
          initial={false}
          animate={
            reduceMotion
              ? { y: "-42vh", opacity: 0.4 }
              : {
                  y: ["12vh", "-115vh"],
                  x: [0, lantern.drift, lantern.drift * 0.35],
                  opacity: [0, 0.75, 0.55, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  y: { duration: lantern.duration, delay: lantern.delay, repeat: Infinity, ease: "linear" },
                  x: { duration: lantern.duration, delay: lantern.delay, repeat: Infinity, ease: "easeInOut" },
                  opacity: {
                    duration: lantern.duration,
                    delay: lantern.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.14, 0.72, 1],
                  },
                }
          }
        >
          <SkyLantern tone={tone} delay={lantern.delay} reduceMotion={Boolean(reduceMotion)} />
        </motion.span>
      ))}
    </div>
  );
}

function SkyLantern({
  tone,
  delay,
  reduceMotion,
}: {
  tone: "dusk" | "parchment";
  delay: number;
  reduceMotion: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const paperId = `lantern-paper-${uid}`;
  const sideId = `lantern-side-${uid}`;
  const mouthId = `lantern-mouth-${uid}`;
  const glow =
    tone === "dusk" ? "rgba(232,212,168,0.55)" : "rgba(232,184,199,0.42)";

  return (
    <span className="relative block h-36 w-28">
      <span className="absolute left-1/2 top-[70%] h-16 w-16 -translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="block h-full w-full origin-center rounded-full"
          style={{ backgroundImage: `radial-gradient(circle, ${glow}, transparent 70%)` }}
          animate={reduceMotion ? undefined : { opacity: [0.5, 0.85, 0.55], scale: [0.92, 1.06, 0.96] }}
          transition={{ duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      <svg viewBox="0 0 140 188" className="relative h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={paperId} x1="72" y1="40" x2="72" y2="134" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={fairytale.champagne} />
            <stop offset="55%" stopColor={fairytale.gold} />
            <stop offset="100%" stopColor="#F0E0C0" />
          </linearGradient>
          <linearGradient id={sideId} x1="108" y1="46" x2="138" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={fairytale.goldDeep} />
            <stop offset="100%" stopColor="#9A7A4A" />
          </linearGradient>
          <radialGradient id={mouthId} cx="50%" cy="38%" r="68%">
            <stop offset="0%" stopColor="#FFF8E8" />
            <stop offset="38%" stopColor={fairytale.blush} />
            <stop offset="100%" stopColor={fairytale.dustyRose} />
          </radialGradient>
        </defs>

        <path d="M108 50 L134 62 L138 124 L112 116 Z" fill={`url(#${sideId})`} />
        <path
          d="M40 54 C38 44 48 40 56 40 L98 38 C108 38 112 46 112 54 L112 114 C112 122 104 124 96 124 L48 128 C36 128 32 120 34 112 Z"
          fill={`url(#${paperId})`}
        />
        <path d="M56 40 C78 30 112 34 134 62 L112 50 C100 42 74 40 56 40 Z" fill="#F6E7C1" />
        <path d="M62 41 C84 33 116 38 128 56" fill="none" stroke="#FFF3D6" strokeWidth="1.3" opacity="0.75" />

        <LanternEmblem />

        <path d="M36 122 L110 114 L136 124 L58 140 Z" fill="#2A2438" />
        <path d="M44 122 L106 116 L126 130 L60 138 Z" fill={`url(#${mouthId})`} />
        <g stroke="#5C4030" strokeWidth="0.65" fill="none" opacity="0.8">
          <path d="M48 124 L82 130" />
          <path d="M104 118 L84 129" />
          <path d="M122 128 L86 130" />
          <path d="M62 136 L82 130" />
        </g>
        <ellipse cx="84" cy="130" rx="4.2" ry="1.6" fill={fairytale.dustyRose} />
        <motion.ellipse
          cx="84"
          cy="126"
          rx="7"
          ry="2.4"
          fill="#FFF6CC"
          animate={reduceMotion ? undefined : { opacity: [0.55, 0.9, 0.6], ry: [1.8, 2.8, 2.1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay }}
        />
      </svg>
    </span>
  );
}

function LanternEmblem() {
  return (
    <g transform="translate(72 82)" fill={fairytale.dustyRose}>
      <path
        d="M0,-10 C3,-6 4,-2 0,4 C-4,-2 -3,-6 0,-10Z"
        fill={fairytale.blush}
        opacity="0.9"
      />
      <circle r="2.4" fill={fairytale.champagne} opacity="0.85" />
    </g>
  );
}
