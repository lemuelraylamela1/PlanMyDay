"use client";

import { useReducedMotion, type MotionProps } from "framer-motion";

export const fairytaleEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Scroll-triggered cinematic reveal: fade, rise, and a soft rotateX / depth pop.
 * Returns no motion when reduced motion is preferred.
 */
export function useReveal() {
  const reduceMotion = useReducedMotion();

  return function reveal(delay = 0, distance = 28): MotionProps {
    if (reduceMotion) return {};
    return {
      initial: { opacity: 0, y: distance, rotateX: 10, z: -48 },
      whileInView: { opacity: 1, y: 0, rotateX: 0, z: 0 },
      viewport: { once: true, margin: "0px 0px -10% 0px" },
      transition: { duration: 1.15, ease: fairytaleEase, delay },
      style: { transformPerspective: 1200, transformStyle: "preserve-3d" },
    };
  };
}
