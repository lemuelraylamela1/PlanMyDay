"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMounted } from "../hooks/use-mounted";
import {
  useLanternPerf,
  useMainEffectsActive,
} from "../performance/lantern-perf-provider";
import { scaleEffectCount } from "../performance/profiles";

type Firefly = {
  left: number;
  top: number;
  size: number;
  driftDuration: number;
  driftDelay: number;
  twinkleDuration: number;
  twinkleDelay: number;
};

function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 57.3 + salt * 149.9) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Tiny glowing particles that drift slowly and twinkle — pure CSS animations
 * (transform/opacity only) so they stay cheap on mobile. Decorative only.
 */
export function Fireflies({
  count = 14,
  className,
  active: activeProp,
}: {
  count?: number;
  className?: string;
  active?: boolean;
}) {
  const mounted = useMounted();
  const { profile, compact } = useLanternPerf();
  const mainActive = useMainEffectsActive();
  const active = activeProp ?? mainActive;
  const safeCount = Math.min(
    scaleEffectCount(count, profile.fireflyScale, compact, 4),
    24,
  );

  const flies = React.useMemo<Firefly[]>(
    () =>
      Array.from({ length: safeCount }, (_, i) => ({
        left: seededUnit(i, 1) * 100,
        top: seededUnit(i, 2) * 100,
        size: seededUnit(i, 3) * 2.5 + 2,
        driftDuration: seededUnit(i, 4) * 8 + 9,
        driftDelay: seededUnit(i, 5) * 6,
        twinkleDuration: seededUnit(i, 6) * 2.5 + 2.5,
        twinkleDelay: seededUnit(i, 7) * 4,
      })),
    [safeCount],
  );

  if (!mounted || !active) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden",
        className,
      )}
    >
      {flies.map((f, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            animation: `firefly-drift ${f.driftDuration}s ease-in-out ${f.driftDelay}s infinite`,
            willChange: "transform",
          }}
        >
          <span
            className="block rounded-full"
            style={{
              width: f.size,
              height: f.size,
              background:
                "radial-gradient(circle, rgba(255,250,220,1), rgba(244,196,68,0.7) 45%, transparent 72%)",
              boxShadow: "0 0 10px rgba(255,214,110,0.9)",
              animation: `firefly-twinkle ${f.twinkleDuration}s ease-in-out ${f.twinkleDelay}s infinite`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
