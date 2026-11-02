import * as React from "react";

/**
 * Three-layer mountain/hill silhouette for Tangled-style depth.
 */
export function HillSilhouette({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d1b5e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1e0f3a" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#23164a" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#160a2e" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#180d38" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0d0720" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* far hills */}
      <path
        d="M0 260 Q180 140 360 200 Q540 260 720 170 Q900 80 1080 200 Q1260 260 1440 210 L1440 320 L0 320 Z"
        fill="url(#hillFar)"
      />

      {/* mid hills */}
      <path
        d="M0 290 Q200 200 400 240 Q600 280 800 210 Q1000 140 1200 240 Q1340 290 1440 260 L1440 320 L0 320 Z"
        fill="url(#hillMid)"
      />

      {/* near ridge */}
      <path
        d="M0 315 Q120 260 300 280 Q480 300 660 260 Q840 220 1020 270 Q1200 310 1440 290 L1440 320 L0 320 Z"
        fill="url(#hillNear)"
      />
    </svg>
  );
}
