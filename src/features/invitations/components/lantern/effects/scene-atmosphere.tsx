"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

export function SceneAtmosphere({
  tone = "warm",
  className,
}: {
  tone?: "warm" | "night" | "lantern-rose";
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.1, 0.55, 0.45, 0.12]);

  const glow =
    tone === "night"
      ? "radial-gradient(ellipse at 50% 45%, rgba(244,196,68,0.18), rgba(232,130,154,0.1) 42%, transparent 72%)"
      : tone === "lantern-rose"
        ? "radial-gradient(ellipse at 50% 40%, rgba(232,130,154,0.18), rgba(244,196,68,0.1) 48%, transparent 72%)"
        : "radial-gradient(ellipse at 50% 50%, rgba(244,196,68,0.16), rgba(255,247,210,0.12) 44%, transparent 72%)";

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <motion.div
        className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ y, background: glow }}
      />
      <motion.div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,196,68,0.5), transparent)",
        }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,130,154,0.35), transparent)",
        }}
      />
    </motion.div>
  );
}
