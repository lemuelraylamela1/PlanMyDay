"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMounted } from "../hooks/use-mounted";

type Dust = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
};

function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function MagicDust({
  count = 24,
  className,
  intensity = "normal",
}: {
  count?: number;
  className?: string;
  intensity?: "soft" | "normal" | "bright";
}) {
  const mounted = useMounted();
  const safeCount = Math.min(count, 30);
  const dust = React.useMemo<Dust[]>(
    () =>
      Array.from({ length: safeCount }, (_, i) => ({
        left: seededUnit(i, 1) * 100,
        top: seededUnit(i, 2) * 100,
        size: seededUnit(i, 3) * 3 + 2,
        delay: seededUnit(i, 4) * 5,
        duration: seededUnit(i, 5) * 5 + 5,
        driftX: seededUnit(i, 6) * 44 - 22,
        driftY: seededUnit(i, 7) * 38 - 28,
      })),
    [safeCount],
  );

  const opacity =
    intensity === "bright" ? [0, 0.95, 0.25, 0.8, 0] : intensity === "soft" ? [0, 0.45, 0.1, 0.35, 0] : [0, 0.7, 0.18, 0.55, 0];

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {mounted &&
        dust.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: "radial-gradient(circle, rgba(255,250,220,1), rgba(244,196,68,0.65) 45%, transparent 72%)",
            boxShadow: "0 0 12px rgba(244,196,68,0.85)",
          }}
          animate={{
            x: [0, d.driftX, -d.driftX * 0.35, 0],
            y: [0, d.driftY, d.driftY * 0.25, 0],
            scale: [0.4, 1.2, 0.75, 1, 0.4],
            opacity,
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
