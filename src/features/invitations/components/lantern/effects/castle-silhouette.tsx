import * as React from "react";

/** A fairytale castle skyline — styled for a deep night-sky background. */
export function CastleSilhouette({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="castleFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3d2870" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1e0f3a" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="castleGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e8829a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2d1b5e" stopOpacity="0" />
        </linearGradient>
        <filter id="castleBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
        </filter>
      </defs>

      {/* subtle glow behind the castle */}
      <ellipse
        cx="720" cy="340"
        rx="380" ry="90"
        fill="url(#castleGlow)"
        opacity="0.5"
      />

      <g fill="url(#castleFill)">
        {/* central keep + main spires */}
        <path d="M690 360 V150 h60 V150 l30-72 30 72 v210 z" />
        <path d="M660 360 V200 h120 V360 z" />
        <path d="M700 108 l10-30 10 30 z" />
        {/* left towers */}
        <path d="M540 360 V230 h44 V230 l22-52 22 52 v130 z" />
        <path d="M470 360 V270 h40 V270 l20-44 20 44 v90 z" />
        {/* right towers */}
        <path d="M832 360 V230 h44 V230 l22-52 22 52 v130 z" />
        <path d="M910 360 V270 h40 V270 l20-44 20 44 v90 z" />
        {/* far flanks */}
        <path d="M380 360 V300 h70 V360 z" />
        <path d="M990 360 V300 h70 V360 z" />
        <path d="M300 360 V320 h60 V360 z" opacity="0.7" />
        <path d="M1080 360 V320 h60 V360 z" opacity="0.7" />
        {/* base wall */}
        <rect x="430" y="320" width="580" height="40" />
      </g>

      {/* lantern-gold flag tips */}
      <g fill="#f4c444" opacity="0.9">
        <path d="M720 78 v-18 l18 9 -18 9" />
        <path d="M562 178 v-13 l13 6.5 -13 6.5" />
        <path d="M854 178 v-13 l13 6.5 -13 6.5" />
      </g>

      {/* faint window glows (lantern light inside) */}
      <g fill="#f4c444" opacity="0.35">
        <rect x="706" y="200" width="8"  height="10" rx="3" />
        <rect x="726" y="200" width="8"  height="10" rx="3" />
        <rect x="553" y="250" width="7"  height="9"  rx="2" />
        <rect x="840" y="250" width="7"  height="9"  rx="2" />
      </g>
    </svg>
  );
}
