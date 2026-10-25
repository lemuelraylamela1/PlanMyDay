"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const lanterns = [
  { className: "left-[7%]", duration: 18, delay: 0, drift: 16 },
  { className: "right-[8%]", duration: 16, delay: 3.5, drift: -14 },
  { className: "left-[24%] hidden sm:flex", duration: 22, delay: 7, drift: 10 },
  { className: "right-[22%] hidden md:flex", duration: 20, delay: 11, drift: -18 },
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
              ? { y: "-42vh", opacity: 0.55 }
              : {
                  y: ["12vh", "-115vh"],
                  x: [0, lantern.drift, lantern.drift * 0.35],
                  opacity: [0, 0.95, 0.8, 0],
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
  const glow = tone === "dusk" ? "rgba(255,186,96,0.72)" : "rgba(232,150,80,0.55)";

  return (
    <span className="relative block h-36 w-28">
      <span className="absolute left-1/2 top-[70%] h-16 w-16 -translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="block h-full w-full origin-center rounded-full"
          style={{ backgroundImage: `radial-gradient(circle, ${glow}, transparent 70%)` }}
          animate={reduceMotion ? undefined : { opacity: [0.65, 1, 0.72], scale: [0.92, 1.08, 0.96] }}
          transition={{ duration: 2.6, delay, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      <svg viewBox="0 0 140 188" className="relative h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={paperId} x1="72" y1="40" x2="72" y2="134" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f6d2a0" />
            <stop offset="55%" stopColor="#ef9f52" />
            <stop offset="100%" stopColor="#ffc56a" />
          </linearGradient>
          <linearGradient id={sideId} x1="108" y1="46" x2="138" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e08c42" />
            <stop offset="100%" stopColor="#c2662c" />
          </linearGradient>
          <radialGradient id={mouthId} cx="50%" cy="38%" r="68%">
            <stop offset="0%" stopColor="#fff6d0" />
            <stop offset="38%" stopColor="#ffb347" />
            <stop offset="100%" stopColor="#e07030" />
          </radialGradient>
        </defs>

        <path d="M108 50 L134 62 L138 124 L112 116 Z" fill={`url(#${sideId})`} />
        <path
          d="M40 54 C38 44 48 40 56 40 L98 38 C108 38 112 46 112 54 L112 114 C112 122 104 124 96 124 L48 128 C36 128 32 120 34 112 Z"
          fill={`url(#${paperId})`}
        />
        <path d="M56 40 C78 30 112 34 134 62 L112 50 C100 42 74 40 56 40 Z" fill="#f8d7a6" />
        <path d="M62 41 C84 33 116 38 128 56" fill="none" stroke="#fff3d6" strokeWidth="1.3" opacity="0.75" />

        <LanternSun />

        <path d="M36 122 L110 114 L136 124 L58 140 Z" fill="#2a1c14" />
        <path d="M44 122 L106 116 L126 130 L60 138 Z" fill={`url(#${mouthId})`} />
        <g stroke="#5c4030" strokeWidth="0.65" fill="none" opacity="0.8">
          <path d="M48 124 L82 130" />
          <path d="M104 118 L84 129" />
          <path d="M122 128 L86 130" />
          <path d="M62 136 L82 130" />
        </g>
        <ellipse cx="84" cy="130" rx="4.2" ry="1.6" fill="#9a241c" />
        <motion.ellipse
          cx="84"
          cy="126"
          rx="7"
          ry="2.4"
          fill="#fff6cc"
          animate={reduceMotion ? undefined : { opacity: [0.7, 1, 0.75], ry: [1.8, 3.1, 2.2] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay }}
        />
      </svg>
    </span>
  );
}

function LanternSun() {
  const rays = [0, 32, 64, 98, 132, 164, 198, 230, 262, 296, 328];

  return (
    <g transform="translate(72 82)" fill="#c45324">
      {rays.map((angle, index) => (
        <path
          key={angle}
          d={
            index % 2 === 0
              ? "M0,-6.5 C2.2,-10 2.4,-13 0,-16 C-2.4,-13 -2.2,-10 0,-6.5"
              : "M0,-6.5 C1.5,-9 1.6,-11 0,-13.5 C-1.6,-11 -1.5,-9 0,-6.5"
          }
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r="6.4" fill="#d4622c" />
      <circle r="2.8" fill="#f0b07a" opacity="0.4" />
    </g>
  );
}
