"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useMounted } from "../hooks/use-mounted";

type Spark = {
  angle: number;
  distance: number;
  size: number;
  delay: number;
  color: string;
};

const COLORS = ["#ddbf8d", "#f4e3bf", "#e8b8c7", "#ffffff"] as const;

function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 83.9 + salt * 193.1) * 43758.5453;
  return x - Math.floor(x);
}

/** A radial burst of sparkles, used for the RSVP success moment. Client-only to avoid hydration style mismatches from Framer Motion. */
export function SparkleBurst({
  count = 24,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const mounted = useMounted();

  const sparks = React.useMemo<Spark[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + seededUnit(i, 1) * 0.3,
        distance: seededUnit(i, 2) * 120 + 80,
        size: seededUnit(i, 3) * 8 + 4,
        delay: seededUnit(i, 4) * 0.2,
        color: COLORS[Math.floor(seededUnit(i, 5) * COLORS.length)] ?? "#ddbf8d",
      })),
    [count],
  );

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 ${className ?? ""}`}
    >
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{
            width: s.size,
            height: s.size,
            background: s.color,
            borderRadius: "9999px",
            boxShadow: `0 0 10px ${s.color}`,
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: Math.cos(s.angle) * s.distance,
            y: Math.sin(s.angle) * s.distance,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            delay: s.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}
