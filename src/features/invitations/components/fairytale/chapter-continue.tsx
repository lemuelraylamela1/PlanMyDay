"use client";

import { motion, useInView, useReducedMotion, type MotionProps } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";
import { fairytaleEase } from "@/features/invitations/components/fairytale/use-reveal";
import { smallCaps } from "@/features/invitations/components/fairytale/ornaments";

type Tone = "paper" | "dusk" | "hero";

const toneClasses: Record<Tone, { link: string; rail: string; sweep: string }> = {
  paper: {
    link: "text-[#9b7b62] hover:text-[#B76E79] focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-[#FFFDF8]",
    rail: "bg-[#DDBF8D]/35",
    sweep: "bg-[#B76E79]",
  },
  dusk: {
    link: "text-[#DDBF8D]/75 hover:text-[#DDBF8D] focus-visible:ring-[#DDBF8D]",
    rail: "bg-[#DDBF8D]/30",
    sweep: "bg-[#E8B8C7]",
  },
  hero: {
    link: "text-[#FFFDF8]/75 hover:text-[#DDBF8D] focus-visible:ring-[#FFFDF8]",
    rail: "bg-[#FFFDF8]/30",
    sweep: "bg-[#DDBF8D]",
  },
};

interface Props {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  align?: "center" | "start";
  className?: string;
  revealProps?: MotionProps;
}

/** Shared chapter continue control — soft sweep only while in view. */
export function ChapterContinue({
  href,
  children,
  tone = "paper",
  align = "center",
  className,
  revealProps,
}: Props) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const styles = toneClasses[tone];

  return (
    <motion.a
      ref={ref}
      href={href}
      {...revealProps}
      className={cn(
        smallCaps,
        "inline-flex flex-col gap-3 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-4",
        align === "center" ? "items-center" : "items-start",
        styles.link,
        className,
      )}
    >
      {children}
      <span aria-hidden className={cn("relative block h-10 w-px overflow-hidden", styles.rail)}>
        <motion.span
          className={cn("absolute inset-x-0 top-0 block h-1/2", styles.sweep)}
          animate={
            reduceMotion || !inView
              ? { y: "40%" }
              : { y: ["-100%", "200%"] }
          }
          transition={
            reduceMotion || !inView
              ? { duration: 0.2 }
              : { duration: 3.2, repeat: Infinity, ease: fairytaleEase }
          }
        />
      </span>
    </motion.a>
  );
}
