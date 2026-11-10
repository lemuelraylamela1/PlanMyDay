"use client";

import * as React from "react";

/**
 * Disney-style fairytale castle — richer layout, classic blue roofs,
 * warm stone, and lit windows. Built as layered SVG for depth.
 */
export function CastleSilhouette({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = React.useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg
      viewBox="0 0 1440 460"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
      className={className}
      style={style}
    >
      <defs>
        {/* Stone bodies */}
        <linearGradient id={id("stoneFar")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9b8d4" />
          <stop offset="100%" stopColor="#7a6488" />
        </linearGradient>
        <linearGradient id={id("stoneMid")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d5e0" />
          <stop offset="55%" stopColor="#b89aa8" />
          <stop offset="100%" stopColor="#6e5268" />
        </linearGradient>
        <linearGradient id={id("stoneNear")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6ebe8" />
          <stop offset="40%" stopColor="#d4b4c0" />
          <stop offset="100%" stopColor="#8a6478" />
        </linearGradient>
        <linearGradient id={id("stoneKeep")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff6f0" />
          <stop offset="35%" stopColor="#e8c8d4" />
          <stop offset="100%" stopColor="#9a7088" />
        </linearGradient>

        {/* Side shading for volume */}
        <linearGradient id={id("shadeL")} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#2a1838" stopOpacity="0" />
          <stop offset="100%" stopColor="#2a1838" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={id("shadeR")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a1838" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff0d0" stopOpacity="0.22" />
        </linearGradient>

        {/* Classic Disney blue roofs */}
        <linearGradient id={id("roof")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7eb6f0" />
          <stop offset="40%" stopColor="#3d7ec8" />
          <stop offset="100%" stopColor="#1a4a8a" />
        </linearGradient>
        <linearGradient id={id("roofHi")} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#0d2a55" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#b8dcff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd76a" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={id("roofTall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ec8f8" />
          <stop offset="30%" stopColor="#4a8ad4" />
          <stop offset="100%" stopColor="#163e78" />
        </linearGradient>

        <linearGradient id={id("gold")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0a8" />
          <stop offset="50%" stopColor="#f4c444" />
          <stop offset="100%" stopColor="#c4893a" />
        </linearGradient>

        <radialGradient id={id("win")} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff8d8" />
          <stop offset="50%" stopColor="#ffd76a" />
          <stop offset="100%" stopColor="#e8a040" stopOpacity="0.7" />
        </radialGradient>

        <linearGradient id={id("glow")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd76a" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#e8829a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2d1b5e" stopOpacity="0" />
        </linearGradient>

        <filter id={id("bloom")} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={id("soft")} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Soft glow behind the palace */}
      <ellipse
        cx="720"
        cy="430"
        rx="460"
        ry="120"
        fill={`url(#${id("glow")})`}
        opacity="0.6"
        filter={`url(#${id("soft")})`}
      />

      {/* ════════ FAR WINGS ════════ */}
      <g opacity="0.88">
        {/* Far left house cluster */}
        <path d="M180 460 V355 h90 V460 Z" fill={`url(#${id("stoneFar")})`} />
        <path d="M190 355 l35-42 35 42 Z" fill={`url(#${id("roof")})`} />
        <path d="M190 355 l35-42 35 42 Z" fill={`url(#${id("roofHi")})`} opacity="0.45" />
        <rect x="212" y="390" width="10" height="14" rx="2" fill={`url(#${id("win")})`} opacity="0.55" />

        <path d="M1170 460 V355 h90 V460 Z" fill={`url(#${id("stoneFar")})`} />
        <path d="M1180 355 l35-42 35 42 Z" fill={`url(#${id("roof")})`} />
        <path d="M1180 355 l35-42 35 42 Z" fill={`url(#${id("roofHi")})`} opacity="0.5" />
        <rect x="1208" y="390" width="10" height="14" rx="2" fill={`url(#${id("win")})`} opacity="0.55" />

        {/* Far slender turrets */}
        <path d="M290 460 V320 h48 V460 Z" fill={`url(#${id("stoneFar")})`} />
        <path d="M298 320 l16-50 16 50 Z" fill={`url(#${id("roof")})`} />
        <path d="M298 320 l16-50 16 50 Z" fill={`url(#${id("roofHi")})`} opacity="0.5" />
        <circle cx="314" cy="266" r="2.5" fill={`url(#${id("gold")})`} />

        <path d="M1102 460 V320 h48 V460 Z" fill={`url(#${id("stoneFar")})`} />
        <path d="M1110 320 l16-50 16 50 Z" fill={`url(#${id("roof")})`} />
        <path d="M1110 320 l16-50 16 50 Z" fill={`url(#${id("roofHi")})`} opacity="0.55" />
        <circle cx="1126" cy="266" r="2.5" fill={`url(#${id("gold")})`} />
      </g>

      {/* ════════ OUTER CURTAIN + CORNER TOWERS ════════ */}
      <g>
        {/* Left corner round tower */}
        <path d="M380 460 V250 h88 V460 Z" fill={`url(#${id("stoneMid")})`} />
        <path d="M380 250 h44 v210 h-44 Z" fill={`url(#${id("shadeL")})`} />
        <path d="M424 250 h44 v210 h-44 Z" fill={`url(#${id("shadeR")})`} />
        {/* Conical roof with flared brim */}
        <ellipse cx="424" cy="252" rx="50" ry="10" fill="#2a5a9a" opacity="0.85" />
        <path d="M378 250 l46-95 46 95 Z" fill={`url(#${id("roof")})`} />
        <path d="M378 250 l46-95 46 95 Z" fill={`url(#${id("roofHi")})`} opacity="0.55" />
        <path d="M424 155 L378 250 L424 250 Z" fill="#0d2a55" opacity="0.25" />
        <circle cx="424" cy="152" r="4" fill={`url(#${id("gold")})`} />
        <path d="M424 148 v-24 l18 9 -18 9" fill={`url(#${id("gold")})`} />
        {/* Battlement ring */}
        <path
          d="M380 250 h11 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h11"
          fill={`url(#${id("stoneMid")})`}
        />

        {/* Right corner round tower */}
        <path d="M972 460 V250 h88 V460 Z" fill={`url(#${id("stoneMid")})`} />
        <path d="M972 250 h44 v210 h-44 Z" fill={`url(#${id("shadeL")})`} />
        <path d="M1016 250 h44 v210 h-44 Z" fill={`url(#${id("shadeR")})`} />
        <ellipse cx="1016" cy="252" rx="50" ry="10" fill="#2a5a9a" opacity="0.85" />
        <path d="M970 250 l46-95 46 95 Z" fill={`url(#${id("roof")})`} />
        <path d="M970 250 l46-95 46 95 Z" fill={`url(#${id("roofHi")})`} opacity="0.6" />
        <path d="M1016 155 L970 250 L1016 250 Z" fill="#0d2a55" opacity="0.22" />
        <circle cx="1016" cy="152" r="4" fill={`url(#${id("gold")})`} />
        <path d="M1016 148 v-24 l18 9 -18 9" fill={`url(#${id("gold")})`} />
        <path
          d="M972 250 h11 v-12 h14 v12 h14 v-12 h14 v12 h14 v-12 h11"
          fill={`url(#${id("stoneMid")})`}
        />

        {/* Curtain walls between corner towers and mid towers */}
        <path d="M468 460 V310 h95 V460 Z" fill={`url(#${id("stoneMid")})`} />
        <path d="M468 310 h95 v150 h-95 Z" fill={`url(#${id("shadeL")})`} opacity="0.7" />
        <path
          d="M468 310 h12 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h13"
          fill={`url(#${id("stoneMid")})`}
        />

        <path d="M877 460 V310 h95 V460 Z" fill={`url(#${id("stoneMid")})`} />
        <path d="M877 310 h95 v150 h-95 Z" fill={`url(#${id("shadeR")})`} opacity="0.75" />
        <path
          d="M877 310 h12 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h13"
          fill={`url(#${id("stoneMid")})`}
        />
      </g>

      {/* ════════ MID FLANKING TOWERS ════════ */}
      <g>
        {/* Left mid — taller octagonal feel */}
        <path d="M545 460 V195 h78 V460 Z" fill={`url(#${id("stoneNear")})`} />
        <path d="M545 195 h39 v265 h-39 Z" fill={`url(#${id("shadeL")})`} />
        <path d="M584 195 h39 v265 h-39 Z" fill={`url(#${id("shadeR")})`} />
        <ellipse cx="584" cy="197" rx="44" ry="9" fill="#1e4a88" opacity="0.9" />
        <path d="M544 195 l40-88 40 88 Z" fill={`url(#${id("roofTall")})`} />
        <path d="M544 195 l40-88 40 88 Z" fill={`url(#${id("roofHi")})`} opacity="0.55" />
        <path d="M584 107 L544 195 L584 195 Z" fill="#0d2a55" opacity="0.28" />
        <circle cx="584" cy="104" r="4.5" fill={`url(#${id("gold")})`} />
        <path d="M584 100 v-26 l20 10 -20 10" fill={`url(#${id("gold")})`} />
        <path
          d="M545 195 h10 v-11 h13 v11 h13 v-11 h13 v11 h13 v-11 h11"
          fill={`url(#${id("stoneNear")})`}
        />

        {/* Right mid */}
        <path d="M817 460 V195 h78 V460 Z" fill={`url(#${id("stoneNear")})`} />
        <path d="M817 195 h39 v265 h-39 Z" fill={`url(#${id("shadeL")})`} />
        <path d="M856 195 h39 v265 h-39 Z" fill={`url(#${id("shadeR")})`} />
        <ellipse cx="856" cy="197" rx="44" ry="9" fill="#1e4a88" opacity="0.9" />
        <path d="M816 195 l40-88 40 88 Z" fill={`url(#${id("roofTall")})`} />
        <path d="M816 195 l40-88 40 88 Z" fill={`url(#${id("roofHi")})`} opacity="0.6" />
        <path d="M856 107 L816 195 L856 195 Z" fill="#0d2a55" opacity="0.25" />
        <circle cx="856" cy="104" r="4.5" fill={`url(#${id("gold")})`} />
        <path d="M856 100 v-26 l20 10 -20 10" fill={`url(#${id("gold")})`} />
        <path
          d="M817 195 h10 v-11 h13 v11 h13 v-11 h13 v11 h13 v-11 h11"
          fill={`url(#${id("stoneNear")})`}
        />
      </g>

      {/* Inner courtyard walls */}
      <path d="M623 460 V285 h70 V460 Z" fill={`url(#${id("stoneNear")})`} />
      <path d="M623 285 h70 v175 h-70 Z" fill={`url(#${id("shadeL")})`} opacity="0.65" />
      <path d="M747 460 V285 h70 V460 Z" fill={`url(#${id("stoneNear")})`} />
      <path d="M747 285 h70 v175 h-70 Z" fill={`url(#${id("shadeR")})`} opacity="0.7" />
      <path
        d="M623 285 h11 v-9 h12 v9 h12 v-9 h12 v9 h12 v-9 h11"
        fill={`url(#${id("stoneNear")})`}
      />
      <path
        d="M747 285 h11 v-9 h12 v9 h12 v-9 h12 v9 h12 v-9 h11"
        fill={`url(#${id("stoneNear")})`}
      />

      {/* ════════ CENTRAL KEEP — Disney focal spire ════════ */}
      <g>
        {/* Main keep body — wider base, stepped top */}
        <path d="M655 460 V155 h130 V460 Z" fill={`url(#${id("stoneKeep")})`} />
        <path d="M655 155 h65 v305 h-65 Z" fill={`url(#${id("shadeL")})`} />
        <path d="M720 155 h65 v305 h-65 Z" fill={`url(#${id("shadeR")})`} />

        {/* Upper lantern gallery */}
        <rect x="662" y="235" width="116" height="22" rx="3" fill="#6e4a68" opacity="0.35" />
        <path
          d="M662 235 h10 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h12"
          fill={`url(#${id("stoneKeep")})`}
        />
        {/* Tiny gallery columns */}
        {[676, 698, 720, 742, 764].map((x) => (
          <rect key={x} x={x} y="237" width="3" height="18" rx="1" fill="#fff6f0" opacity="0.45" />
        ))}

        {/* Stepped crown under the spire */}
        <path d="M668 155 h104 v-18 h-104 Z" fill={`url(#${id("stoneKeep")})`} />
        <path d="M668 137 h104 v18 h-104 Z" fill={`url(#${id("shadeR")})`} opacity="0.4" />
        <ellipse cx="720" cy="139" rx="58" ry="11" fill="#1a4a8a" opacity="0.95" />

        {/* Tall central cone — the Disney spire */}
        <path d="M668 137 l52-128 52 128 Z" fill={`url(#${id("roofTall")})`} />
        <path d="M668 137 l52-128 52 128 Z" fill={`url(#${id("roofHi")})`} opacity="0.65" />
        <path d="M720 9 L668 137 L720 137 Z" fill="#0d2a55" opacity="0.32" />
        <path d="M720 9 L772 137 L720 137 Z" fill="#c8e4ff" opacity="0.18" />

        {/* Gold finial + banner */}
        <circle cx="720" cy="6" r="5.5" fill={`url(#${id("gold")})`} />
        <path d="M720 2 v-28 l24 12 -24 12" fill={`url(#${id("gold")})`} />
        <line
          x1="720"
          y1="2"
          x2="720"
          y2="137"
          stroke="#e8c880"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Grand arched gate */}
        <path d="M688 460 V375 q32-42 64 0 V460 Z" fill="#1a1028" opacity="0.85" />
        <path
          d="M696 460 V382 q24-30 48 0 V460 Z"
          fill={`url(#${id("win")})`}
          opacity="0.4"
          filter={`url(#${id("bloom")})`}
        />
        {/* Gate gold trim */}
        <path
          d="M688 460 V375 q32-42 64 0"
          fill="none"
          stroke="#f4c444"
          strokeWidth="2"
          opacity="0.55"
        />
      </g>

      {/* Flying buttresses */}
      <path d="M640 460 V300 l15-22 h12 V460 Z" fill={`url(#${id("stoneMid")})`} />
      <path d="M640 300 l15-22 h12 V460 h-27 Z" fill={`url(#${id("shadeL")})`} opacity="0.5" />
      <path d="M785 460 V300 l-15-22 h-12 V460 Z" fill={`url(#${id("stoneMid")})`} />
      <path d="M785 300 l-15-22 h-12 V460 h27 Z" fill={`url(#${id("shadeR")})`} opacity="0.55" />

      {/* ════════ WINDOWS ════════ */}
      <g filter={`url(#${id("bloom")})`}>
        {/* Keep — arched pairs */}
        <path d="M678 175 h14 v20 q-7 8 -14 0 Z" fill={`url(#${id("win")})`} opacity="0.92" />
        <path d="M713 175 h14 v20 q-7 8 -14 0 Z" fill={`url(#${id("win")})`} opacity="0.98" />
        <path d="M748 175 h14 v20 q-7 8 -14 0 Z" fill={`url(#${id("win")})`} opacity="0.88" />
        <path d="M678 270 h14 v20 q-7 8 -14 0 Z" fill={`url(#${id("win")})`} opacity="0.85" />
        <path d="M713 270 h14 v20 q-7 8 -14 0 Z" fill={`url(#${id("win")})`} opacity="0.95" />
        <path d="M748 270 h14 v20 q-7 8 -14 0 Z" fill={`url(#${id("win")})`} opacity="0.8" />
        {/* Mid towers */}
        <path d="M568 230 h12 v16 q-6 7 -12 0 Z" fill={`url(#${id("win")})`} opacity="0.8" />
        <path d="M588 230 h12 v16 q-6 7 -12 0 Z" fill={`url(#${id("win")})`} opacity="0.75" />
        <path d="M840 230 h12 v16 q-6 7 -12 0 Z" fill={`url(#${id("win")})`} opacity="0.85" />
        <path d="M860 230 h12 v16 q-6 7 -12 0 Z" fill={`url(#${id("win")})`} opacity="0.78" />
        {/* Corner towers */}
        <path d="M408 300 h11 v14 q-5.5 6 -11 0 Z" fill={`url(#${id("win")})`} opacity="0.7" />
        <path d="M428 300 h11 v14 q-5.5 6 -11 0 Z" fill={`url(#${id("win")})`} opacity="0.65" />
        <path d="M1000 300 h11 v14 q-5.5 6 -11 0 Z" fill={`url(#${id("win")})`} opacity="0.75" />
        <path d="M1020 300 h11 v14 q-5.5 6 -11 0 Z" fill={`url(#${id("win")})`} opacity="0.68" />
        {/* Curtain / courtyard */}
        <rect x="498" y="350" width="9" height="12" rx="2" fill={`url(#${id("win")})`} opacity="0.5" />
        <rect x="530" y="350" width="9" height="12" rx="2" fill={`url(#${id("win")})`} opacity="0.45" />
        <rect x="900" y="350" width="9" height="12" rx="2" fill={`url(#${id("win")})`} opacity="0.55" />
        <rect x="932" y="350" width="9" height="12" rx="2" fill={`url(#${id("win")})`} opacity="0.48" />
        <rect x="640" y="330" width="9" height="12" rx="2" fill={`url(#${id("win")})`} opacity="0.55" />
        <rect x="790" y="330" width="9" height="12" rx="2" fill={`url(#${id("win")})`} opacity="0.55" />
      </g>

      {/* Ground settle into hills */}
      <ellipse cx="720" cy="458" rx="400" ry="32" fill="#12081f" opacity="0.5" />
    </svg>
  );
}
