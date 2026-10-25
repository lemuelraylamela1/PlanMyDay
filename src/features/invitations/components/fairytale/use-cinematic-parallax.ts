"use client";

import * as React from "react";
import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Depth = "far" | "mid" | "near" | "foreground";

/** Gentle vertical drift only — rotate/scale/z were dropped because they stutter on scroll. */
const yRange: Record<Depth, [string, string]> = {
  far: ["-5%", "7%"],
  mid: ["-3%", "4%"],
  near: ["4%", "-5%"],
  foreground: ["7%", "-8%"],
};

export function useChapterScroll(ref: React.RefObject<HTMLElement | null>) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const idle = useMotionValue(0.5);
  return reduceMotion ? idle : scrollYProgress;
}

export function useDepthLayer(progress: MotionValue<number>, depth: Depth = "mid") {
  const y = useTransform(progress, [0, 1], yRange[depth]);
  return { y };
}

export function useParallaxY(progress: MotionValue<number>, from: string, to: string) {
  return useTransform(progress, [0, 1], [from, to]);
}
