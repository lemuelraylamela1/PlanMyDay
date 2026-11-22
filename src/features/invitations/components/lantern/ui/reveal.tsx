"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { useLanternPerf } from "../performance/lantern-perf-provider";

const variants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.12,
    },
  }),
};

const cinematicVariants: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.96, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.14,
    },
  }),
};

/** Phones: same motion minus the animated blur, which forces a full repaint per frame. */
const cinematicPhoneVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.12,
    },
  }),
};

const floatVariants: Variants = {
  hidden: { opacity: 0, y: 28, rotateX: -8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.1,
    },
  }),
};

export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
  variant = "fade-up",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section";
  variant?: "fade-up" | "cinematic-card" | "float-in";
}) {
  const MotionTag = motion[as];
  const { compact } = useLanternPerf();
  const selectedVariants =
    variant === "cinematic-card"
      ? compact
        ? cinematicPhoneVariants
        : cinematicVariants
      : variant === "float-in"
        ? floatVariants
        : variants;

  return (
    <MotionTag
      custom={index}
      variants={selectedVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
