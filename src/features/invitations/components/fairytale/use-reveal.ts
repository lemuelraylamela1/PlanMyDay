"use client";

import { useReducedMotion, type MotionProps, type Transition } from "framer-motion";

/**
 * Shared cinematic motion tokens for the invite experience.
 * Prefer these over ad-hoc durations so chapters stay in sync.
 */
export const fairytaleEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Slightly softer ease for ambient loops (no overshoot). */
export const fairytaleSoftEase: [number, number, number, number] = [0.33, 0.1, 0.25, 1];

export const fairytaleMotion = {
  /** Primary enter / whileInView reveals */
  reveal: 0.9,
  /** Short UI feedback (toggles, errors, underlines) */
  ui: 0.4,
  /** Form panel swaps, lightbox shell */
  panel: 0.55,
  /** Crossfades (hero / gallery photos) */
  crossfade: 1.4,
  /** Hero ken burns / long atmospheric settles */
  atmosphere: 2.2,
  /** Stagger between sibling reveals */
  stagger: 0.08,
  /** Default rise distance (px) */
  rise: 16,
} as const;

export function fairytaleTransition(
  duration: number = fairytaleMotion.reveal,
  delay = 0,
): Transition {
  return { duration, ease: fairytaleEase, delay };
}

/**
 * Soft fade-and-rise. Kept in 2D so scrolling stays smooth on phones.
 * Returns no motion when reduced motion is preferred.
 */
export function useReveal() {
  const reduceMotion = useReducedMotion();

  return function reveal(delay = 0, distance: number = fairytaleMotion.rise): MotionProps {
    if (reduceMotion) return {};
    return {
      initial: { opacity: 0, y: distance },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "0px 0px -10% 0px", amount: 0.2 },
      transition: fairytaleTransition(fairytaleMotion.reveal, delay),
    };
  };
}
