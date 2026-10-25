"use client";

import * as React from "react";
import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Shared stage perspective for chapter 3D scenes. */
export const cinematicPerspective = "1400px";

type Depth = "far" | "mid" | "near" | "foreground";

const depthConfig: Record<
  Depth,
  { y: [string, string]; rotateX: [number, number]; scale: [number, number]; z: [number, number] }
> = {
  far: { y: ["-8%", "10%"], rotateX: [6, -4], scale: [1.12, 1.02], z: [-120, -40] },
  mid: { y: ["-4%", "6%"], rotateX: [3, -2], scale: [1.04, 1], z: [-40, 0] },
  near: { y: ["6%", "-10%"], rotateX: [-2, 4], scale: [1, 1.03], z: [20, 80] },
  foreground: { y: ["10%", "-16%"], rotateX: [-4, 6], scale: [1, 1.05], z: [60, 140] },
};

/**
 * Scroll progress for a chapter section (enters bottom → exits top).
 * Returns a static 0.5 MotionValue when reduced motion is preferred.
 */
export function useChapterScroll(ref: React.RefObject<HTMLElement | null>) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const idle = useMotionValue(0.5);
  return reduceMotion ? idle : scrollYProgress;
}

/** Multi-axis depth layer driven by chapter scroll progress. */
export function useDepthLayer(progress: MotionValue<number>, depth: Depth = "mid") {
  const config = depthConfig[depth];
  const y = useTransform(progress, [0, 1], config.y);
  const rotateX = useTransform(progress, [0, 1], config.rotateX);
  const scale = useTransform(progress, [0, 1], config.scale);
  const z = useTransform(progress, [0, 1], config.z);
  return { y, rotateX, scale, z };
}

/** Soft fade as a section leaves the viewport (cinematic dissolve). */
export function useExitDissolve(progress: MotionValue<number>) {
  return useTransform(progress, [0.12, 0.45, 0.88], [0.45, 1, 0.7]);
}

/** Custom y range when the shared depth presets are too strong/weak. */
export function useParallaxY(
  progress: MotionValue<number>,
  from: string,
  to: string,
) {
  return useTransform(progress, [0, 1], [from, to]);
}

export function useParallaxRotateX(
  progress: MotionValue<number>,
  from: number,
  to: number,
) {
  return useTransform(progress, [0, 1], [from, to]);
}

export function useParallaxScale(
  progress: MotionValue<number>,
  from: number,
  to: number,
) {
  return useTransform(progress, [0, 1], [from, to]);
}
