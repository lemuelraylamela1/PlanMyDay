"use client";

import * as React from "react";
import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { useAnimationQuality } from "@/features/invitations/components/fairytale/animation-quality/animation-quality-provider";

type Depth = "far" | "mid" | "near" | "foreground";

/**
 * Gentle vertical drift only — rotate/scale/z were dropped because they stutter
 * on scroll. Ranges kept subtle so they don't fight GSAP scene layers.
 */
const yRange: Record<Depth, [string, string]> = {
  far: ["-3.5%", "4.5%"],
  mid: ["-2%", "2.5%"],
  near: ["2.5%", "-3%"],
  foreground: ["4%", "-5%"],
};

/** Scales a CSS length like "-3.5%" by the quality tier's parallax factor. */
function scaleOffset(value: string, factor: number) {
  if (factor === 1) return value;
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return value;
  const unit = value.replace(/^-?[\d.]+/, "");
  return `${Number((amount * factor).toFixed(3))}${unit}`;
}

/** Scroll progress for a chapter. Static when motion is reduced or the tier disables parallax. */
export function useChapterScroll(ref: React.RefObject<HTMLElement | null>) {
  const reduceMotion = useReducedMotion();
  const { profile } = useAnimationQuality();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const idle = useMotionValue(0.5);
  return reduceMotion || profile.parallax === 0 ? idle : scrollYProgress;
}

export function useDepthLayer(progress: MotionValue<number>, depth: Depth = "mid") {
  const [from, to] = yRange[depth];
  return { y: useParallaxY(progress, from, to) };
}

export function useParallaxY(progress: MotionValue<number>, from: string, to: string) {
  const { profile } = useAnimationQuality();
  const factor = profile.parallax;
  return useTransform(progress, [0, 1], [scaleOffset(from, factor), scaleOffset(to, factor)]);
}
