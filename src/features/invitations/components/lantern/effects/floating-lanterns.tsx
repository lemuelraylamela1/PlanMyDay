"use client";

import * as React from "react";
import { useMounted } from "../hooks/use-mounted";
import {
  useLanternPerf,
  useMainEffectsActive,
} from "../performance/lantern-perf-provider";
import { scaleEffectCount } from "../performance/profiles";

type Lantern = {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  sway: number;
  opacity: number;
  swayDuration: number;
};

function seededUnit(index: number, salt: number) {
  const x = Math.sin(index * 91.7 + salt * 271.3) * 43758.5453;
  return x - Math.floor(x);
}

/** A single Tangled-style paper sky lantern with a warm inner glow and flame. */
function SkyLantern({ size, idPrefix }: { size: number; idPrefix: string }) {
  const bodyId = `${idPrefix}-body`;
  const flameId = `${idPrefix}-flame`;

  return (
    <div className="relative" style={{ width: size, height: size * 1.4 }}>
      {/* soft ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background:
            "radial-gradient(circle, rgba(255,200,120,0.5) 0%, rgba(255,170,80,0.14) 45%, transparent 70%)",
        }}
      />

      <svg viewBox="0 0 100 140" className="relative h-full w-full">
        <defs>
          <radialGradient id={bodyId} cx="50%" cy="78%" r="65%">
            <stop offset="0%" stopColor="#fff6da" />
            <stop offset="45%" stopColor="#ffd98a" />
            <stop offset="80%" stopColor="#f0a94e" />
            <stop offset="100%" stopColor="#d98736" />
          </radialGradient>
          <radialGradient id={flameId} cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="40%" stopColor="#ffe9a8" />
            <stop offset="100%" stopColor="#ff9d3c" />
          </radialGradient>
        </defs>

        <rect x="42" y="2" width="16" height="8" rx="3" fill="#c98a3c" opacity="0.9" />

        <path
          d="M50 8
             C 24 8, 13 24, 13 52
             C 13 80, 21 102, 34 113
             L 66 113
             C 79 102, 87 80, 87 52
             C 87 24, 76 8, 50 8 Z"
          fill={`url(#${bodyId})`}
          stroke="#e6a24f"
          strokeWidth="1"
          strokeOpacity="0.7"
        />

        <g stroke="#cf8b3e" strokeOpacity="0.35" strokeWidth="0.9" fill="none">
          <path d="M50 8 C 50 60, 50 90, 50 113" />
          <path d="M30 12 C 22 55, 26 92, 36 112" />
          <path d="M70 12 C 78 55, 74 92, 64 112" />
        </g>

        <g stroke="#cf8b3e" strokeOpacity="0.3" strokeWidth="0.8" fill="none">
          <path d="M15 46 C 38 40, 62 40, 85 46" />
          <path d="M13 78 C 38 73, 62 73, 87 78" />
        </g>

        <path
          d="M34 113 L 66 113"
          stroke="#b9772f"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <g
          style={{
            transformOrigin: "50px 110px",
            animation: "lantern-flame 1.8s ease-in-out infinite",
          }}
        >
          <path
            d="M50 96 C 45 104, 45 112, 50 116 C 55 112, 55 104, 50 96 Z"
            fill={`url(#${flameId})`}
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Softly glowing sky lanterns drifting upward.
 * Pure CSS transform animations for steady 60fps motion.
 */
export function FloatingLanterns({
  count = 12,
  className,
  intensity = "ambient",
  active: activeProp,
}: {
  count?: number;
  className?: string;
  intensity?: "ambient" | "festival";
  active?: boolean;
}) {
  const mounted = useMounted();
  const instanceId = React.useId();
  const { profile, compact } = useLanternPerf();
  const mainActive = useMainEffectsActive();
  const active = activeProp ?? mainActive;

  const maxCount = intensity === "festival" ? 20 : 12;
  const safeCount = Math.min(
    scaleEffectCount(count, profile.lanternScale, compact, 3),
    maxCount,
  );

  const lanterns = React.useMemo<Lantern[]>(
    () =>
      Array.from({ length: safeCount }, (_, i) => ({
        left: (i / Math.max(safeCount, 1)) * 100 + (seededUnit(i, 1) * 6 - 3),
        size:
          seededUnit(i, 2) * (intensity === "festival" ? 22 : 18) +
          (intensity === "festival" ? 14 : 16),
        delay: seededUnit(i, 3) * (intensity === "festival" ? 6 : 9),
        duration: seededUnit(i, 4) * 8 + (intensity === "festival" ? 16 : 18),
        drift:
          seededUnit(i, 5) * (intensity === "festival" ? 48 : 36) -
          (intensity === "festival" ? 24 : 18),
        sway: seededUnit(i, 6) * 5 + 2.5,
        swayDuration: seededUnit(i, 8) * 3 + 4.5,
        opacity:
          seededUnit(i, 7) * 0.35 + (intensity === "festival" ? 0.5 : 0.45),
      })),
    [safeCount, intensity],
  );

  if (!mounted || !active) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden ${className ?? ""}`}
    >
      {lanterns.map((l, i) => (
        <div
          key={i}
          className="absolute bottom-0 will-change-transform"
          style={{
            left: `${l.left}%`,
            opacity: l.opacity,
            animation: `lantern-rise ${l.duration}s ease-in ${l.delay}s infinite, lantern-sway ${l.swayDuration}s ease-in-out ${l.delay}s infinite`,
            "--lantern-drift": `${l.drift}px`,
          } as React.CSSProperties}
        >
          <SkyLantern size={l.size} idPrefix={`${instanceId}-${i}`} />
        </div>
      ))}
    </div>
  );
}
