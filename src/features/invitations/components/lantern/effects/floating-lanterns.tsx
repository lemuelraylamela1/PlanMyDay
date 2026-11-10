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

/** Decorative vine + star band used near the top and bottom of the lantern. */
function LanternBand({ y, color }: { y: number; color: string }) {
  const star = (cx: number, cy: number, r: number) =>
    `M${cx} ${cy - r} L${cx + r * 0.28} ${cy - r * 0.28} L${cx + r} ${cy} L${cx + r * 0.28} ${cy + r * 0.28} L${cx} ${cy + r} L${cx - r * 0.28} ${cy + r * 0.28} L${cx - r} ${cy} L${cx - r * 0.28} ${cy - r * 0.28} Z`;

  return (
    <g fill={color} stroke={color} strokeWidth="1.1" strokeLinecap="round">
      <path
        d={`M22 ${y} C 30 ${y - 4}, 36 ${y + 4}, 42 ${y}
            C 48 ${y - 4}, 52 ${y + 4}, 58 ${y}
            C 64 ${y - 4}, 70 ${y + 4}, 78 ${y}`}
        fill="none"
        strokeOpacity="0.95"
      />
      <path d={star(30, y - 1, 2.2)} />
      <path d={star(50, y - 2, 2.8)} />
      <path d={star(70, y - 1, 2.2)} />
      <circle cx="40" cy={y + 0.2} r="1.1" opacity="0.85" />
      <circle cx="60" cy={y + 0.2} r="1.1" opacity="0.85" />
    </g>
  );
}

/**
 * Tangled festival lantern — cylindrical paper body, sun crest, ornate bands.
 * Matches the classic Rapunzel lantern look.
 */
function SkyLantern({ size, idPrefix }: { size: number; idPrefix: string }) {
  const bodyId = `${idPrefix}-body`;
  const flameId = `${idPrefix}-flame`;

  return (
    <div className="relative" style={{ width: size, height: size * 1.55 }}>
      <div
        className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 1.9,
          height: size * 1.9,
          background:
            "radial-gradient(circle, rgba(255,200,90,0.4) 0%, rgba(255,140,40,0.12) 42%, transparent 70%)",
        }}
      />

      <svg viewBox="0 0 100 155" className="relative h-full w-full overflow-visible">
        <defs>
          {/* Bright yellow at the open bottom → peach/orange at the crown */}
          <linearGradient id={bodyId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="28%" stopColor="#ffd45a" />
            <stop offset="62%" stopColor="#f5a24a" />
            <stop offset="100%" stopColor="#e8894a" />
          </linearGradient>
          <radialGradient id={flameId} cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#fffef8" />
            <stop offset="45%" stopColor="#ffe5a0" />
            <stop offset="100%" stopColor="#ff8f28" />
          </radialGradient>
        </defs>

        {/* Cylindrical paper body with softly rounded ends */}
        <path
          d="M24 26
             C 24 16, 36 12, 50 12
             C 64 12, 76 16, 76 26
             L 76 118
             C 76 128, 64 132, 50 132
             C 36 132, 24 128, 24 118 Z"
          fill={`url(#${bodyId})`}
          stroke="#d48938"
          strokeWidth="1.05"
          strokeOpacity="0.55"
        />

        {/* Soft side volume */}
        <path
          d="M24 28 C 24 18, 36 14, 40 14 L 40 130 C 34 129, 24 124, 24 118 Z"
          fill="#c45e20"
          opacity="0.12"
        />
        <path
          d="M76 28 C 76 18, 64 14, 60 14 L 60 130 C 66 129, 76 124, 76 118 Z"
          fill="#c45e20"
          opacity="0.12"
        />

        {/* Top decorative band (dark red) */}
        <LanternBand y={28} color="#9a2e1c" />

        {/* Tangled sun crest — dark reddish-orange with wavy flame rays */}
        <g transform="translate(50 72)">
          <circle r="9.5" fill="#9a2e1c" />
          <circle r="7.2" fill="#b53a22" />
          <g fill="#9a2e1c">
            <path d="M0 -11 C 2 -14, 3 -17, 0 -20 C -3 -17, -2 -14, 0 -11 Z" />
            <path d="M0 11 C 2 14, 3 17, 0 20 C -3 17, -2 14, 0 11 Z" />
            <path d="M11 0 C 14 2, 17 3, 20 0 C 17 -3, 14 -2, 11 0 Z" />
            <path d="M-11 0 C -14 2, -17 3, -20 0 C -17 -3, -14 -2, -11 0 Z" />
            <path d="M8 -8 C 11 -12, 14 -13, 16 -16 C 12 -15, 10 -13, 8 -8 Z" />
            <path d="M8 8 C 11 12, 14 13, 16 16 C 12 15, 10 13, 8 8 Z" />
            <path d="M-8 -8 C -11 -12, -14 -13, -16 -16 C -12 -15, -10 -13, -8 -8 Z" />
            <path d="M-8 8 C -11 12, -14 13, -16 16 C -12 15, -10 13, -8 8 Z" />
          </g>
          <circle r="3.2" fill="#d45530" opacity="0.85" />
        </g>

        {/* Bottom decorative band (warmer orange-red) */}
        <LanternBand y={116} color="#c45a2e" />

        {/* Top bamboo / paper rim */}
        <rect x="32" y="9" width="36" height="6" rx="3" fill="#7a4018" />
        <rect x="38" y="6.5" width="24" height="4" rx="2" fill="#5e3010" />

        {/* Bottom open rim */}
        <path d="M32 132 L 68 132" stroke="#7a4018" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M36 135.5 L 64 135.5"
          stroke="#a86828"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Flame at the open bottom */}
        <g
          style={{
            transformOrigin: "50px 124px",
            animation: "lantern-flame 1.8s ease-in-out infinite",
          }}
        >
          <path
            d="M50 116 C 45 122, 44 129, 50 135 C 56 129, 55 122, 50 116 Z"
            fill={`url(#${flameId})`}
          />
          <ellipse cx="50" cy="125" rx="4" ry="5.5" fill="#fff8e0" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Softly glowing Tangled sky lanterns rising from the bottom of the screen.
 */
export function FloatingLanterns({
  count = 12,
  className,
  intensity = "ambient",
  sizeScale = 1,
  active: activeProp,
}: {
  count?: number;
  className?: string;
  intensity?: "ambient" | "festival";
  sizeScale?: number;
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
          (seededUnit(i, 2) * (intensity === "festival" ? 22 : 18) +
            (intensity === "festival" ? 14 : 16)) *
          sizeScale,
        delay: seededUnit(i, 3) * (intensity === "festival" ? 6 : 9),
        duration: seededUnit(i, 4) * 8 + (intensity === "festival" ? 16 : 18),
        drift:
          seededUnit(i, 5) * (intensity === "festival" ? 48 : 36) -
          (intensity === "festival" ? 24 : 18),
        sway: seededUnit(i, 6) * 5 + 2.5,
        swayDuration: seededUnit(i, 8) * 3 + 4.5,
        opacity:
          seededUnit(i, 7) * 0.28 + (intensity === "festival" ? 0.58 : 0.52),
      })),
    [safeCount, intensity, sizeScale],
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
            animation: `lantern-rise ${l.duration}s linear ${l.delay}s infinite`,
            "--lantern-drift": `${l.drift}px`,
            "--lantern-opacity": String(l.opacity),
          } as React.CSSProperties}
        >
          <div
            className="will-change-transform"
            style={{
              animation: `lantern-sway ${l.swayDuration}s ease-in-out ${l.delay}s infinite`,
              "--lantern-sway": `${l.sway}deg`,
            } as React.CSSProperties}
          >
            <SkyLantern size={l.size} idPrefix={`${instanceId}-${i}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
