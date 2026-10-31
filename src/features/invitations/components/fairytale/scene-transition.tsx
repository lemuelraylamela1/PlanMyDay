"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type SceneTone =
  | "hero"
  | "paper"
  | "cinema"
  | "gallery"
  | "dusk"
  | "forest"
  | "dawn";

const atmosphereByTone: Record<SceneTone, string> = {
  hero:
    "radial-gradient(ellipse 64% 38% at 18% 22%, rgba(201,184,232,0.18), transparent 72%), radial-gradient(ellipse 44% 34% at 82% 76%, rgba(232,212,168,0.12), transparent 70%)",
  paper:
    "radial-gradient(ellipse 55% 38% at 82% 18%, rgba(201,184,232,0.13), transparent 72%), radial-gradient(ellipse 48% 30% at 18% 78%, rgba(232,184,199,0.12), transparent 72%)",
  cinema:
    "radial-gradient(ellipse 62% 42% at 50% 42%, rgba(221,191,141,0.13), transparent 72%), linear-gradient(180deg, rgba(34,36,58,0.03), transparent 38%, rgba(34,36,58,0.08))",
  gallery:
    "radial-gradient(ellipse 50% 34% at 16% 30%, rgba(232,184,199,0.11), transparent 70%), radial-gradient(ellipse 44% 32% at 84% 70%, rgba(201,184,232,0.14), transparent 72%)",
  dusk:
    "radial-gradient(ellipse 58% 42% at 50% 18%, rgba(201,184,232,0.18), transparent 70%), radial-gradient(ellipse 40% 34% at 80% 76%, rgba(232,212,168,0.12), transparent 72%)",
  forest:
    "radial-gradient(ellipse 48% 40% at 24% 36%, rgba(201,184,232,0.13), transparent 72%), radial-gradient(ellipse 46% 36% at 76% 66%, rgba(232,212,168,0.14), transparent 74%)",
  dawn:
    "radial-gradient(ellipse 62% 38% at 50% 8%, rgba(232,212,168,0.2), transparent 70%), radial-gradient(ellipse 48% 34% at 82% 42%, rgba(232,184,199,0.12), transparent 72%)",
};

const veilByTone: Record<SceneTone, string> = {
  hero: "linear-gradient(180deg, rgba(201,184,232,0.14), transparent)",
  paper: "linear-gradient(180deg, rgba(201,184,232,0.12), transparent)",
  cinema: "linear-gradient(180deg, rgba(34,36,58,0.11), transparent)",
  gallery: "linear-gradient(180deg, rgba(232,184,199,0.1), transparent)",
  dusk: "linear-gradient(180deg, rgba(201,184,232,0.2), transparent)",
  forest: "linear-gradient(180deg, rgba(26,28,46,0.38), transparent)",
  dawn: "linear-gradient(180deg, rgba(243,231,211,0.3), transparent)",
};

const motes = [
  { left: "9%", top: "22%", size: 3 },
  { left: "22%", top: "68%", size: 2 },
  { left: "41%", top: "34%", size: 2 },
  { left: "63%", top: "76%", size: 3 },
  { left: "79%", top: "28%", size: 2 },
  { left: "91%", top: "58%", size: 2 },
];

interface Props {
  tone: SceneTone;
  className?: string;
}

/**
 * Decorative scene depth owned by ScrollTrigger. It stays static when
 * JavaScript, reduced motion, or mobile performance constraints disable it.
 */
export function SceneTransition({ tone, className }: Props) {
  const isNight = tone === "hero" || tone === "dusk" || tone === "forest";

  return (
    <div
      aria-hidden
      data-scene-atmosphere
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        data-scene-backdrop
        className="absolute -inset-[8%] will-change-transform"
        style={{ backgroundImage: atmosphereByTone[tone] }}
      />
      <div
        data-scene-veil
        className="absolute inset-x-0 top-0 h-40 opacity-70 sm:h-56"
        style={{ backgroundImage: veilByTone[tone] }}
      />
      <div className="absolute inset-0 opacity-70">
        {motes.map((mote, index) => (
          <span
            key={`${mote.left}-${mote.top}`}
            data-scene-particle
            className={cn(
              "absolute rounded-full will-change-transform",
              index > 3 && "hidden sm:block",
            )}
            style={{
              left: mote.left,
              top: mote.top,
              width: mote.size,
              height: mote.size,
              background: isNight ? "#E8D4A8" : "#C9A66B",
              boxShadow: isNight
                ? "0 0 12px rgba(232,212,168,0.75)"
                : "0 0 10px rgba(201,166,107,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
