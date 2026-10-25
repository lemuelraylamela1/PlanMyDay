"use client";

import { useReducedMotion, type MotionProps } from "framer-motion";

export const fairytaleEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Scroll-triggered fade-and-rise used by every chapter. Returns no motion when reduced motion is preferred. */
export function useReveal() {
  const reduceMotion = useReducedMotion();

  return function reveal(delay = 0, distance = 24): MotionProps {
    if (reduceMotion) return {};
    return {
      initial: { opacity: 0, y: distance },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "0px 0px -12% 0px" },
      transition: { duration: 1, ease: fairytaleEase, delay },
    };
  };
}
