"use client";

import * as React from "react";

import { grainOverlay } from "@/features/invitations/components/fairytale/textures";

export const castleNightImages = {
  desktop: "/invitation-intro/castle-night-desktop-hd.jpg",
  mobile: "/invitation-intro/castle-night-mobile-hd.jpg",
} as const;

interface Props {
  lanternCount: number;
}

/**
 * Night castle backdrop for the opening sequence. Idle uses a lightly dimmed
 * sharp image (not a heavy blur) so the kingdom stays HD; a soft vignette does
 * the depth work instead of a blur filter.
 */
export function IntroCastleScene({ lanternCount }: Props) {
  const lanterns = React.useMemo(
    () =>
      Array.from({ length: lanternCount }, (_, i) => {
        const depth = i % 3;
        const size = depth === 0 ? 7 : depth === 1 ? 11 : 16;
        return {
          id: i,
          left: `${4 + ((i * 41) % 92)}%`,
          top: `${12 + ((i * 29) % 70)}%`,
          size,
          opacity: depth === 0 ? 0.55 : depth === 1 ? 0.75 : 0.95,
        };
      }),
    [lanternCount],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#1d1a33]">
      <div data-castle-camera className="absolute inset-0 will-change-transform">
        <CastlePicture layer="sharp" className="absolute inset-0" />
        {/* Soft dim overlay instead of blur(14px) — keeps the HD image crisp. */}
        <div
          data-castle-layer="blur"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(20,16,40,0.28) 0%, rgba(12,10,28,0.62) 100%)",
          }}
        />
      </div>

      <div
        data-castle-scrim
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(29,26,51,0.08), rgba(14,12,28,0.45) 100%)",
        }}
      />

      {lanterns.map((l) => (
        <span
          key={l.id}
          data-lantern
          className="absolute rounded-[38%_38%_30%_30%/45%_45%_28%_28%]"
          style={{
            left: l.left,
            top: l.top,
            width: l.size,
            height: l.size * 1.25,
            opacity: 0,
            ["--lantern-opacity" as string]: l.opacity,
            backgroundImage:
              "radial-gradient(ellipse 70% 60% at 50% 72%, #FFF1C4 0%, #F7B955 48%, #C26A2C 100%)",
            boxShadow: `0 0 ${l.size}px rgba(255,186,96,0.65), 0 0 ${l.size * 2.4}px rgba(255,160,80,0.25)`,
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: grainOverlay }}
      />
    </div>
  );
}

function CastlePicture({
  layer,
  className,
  style,
}: {
  layer: "sharp" | "blur";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <picture data-castle-layer={layer} className={className} style={style}>
      <source media="(min-width: 640px)" srcSet={castleNightImages.desktop} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={castleNightImages.mobile}
        alt=""
        decoding="async"
        fetchPriority="high"
        className="block h-full w-full object-cover object-[50%_36%] sm:object-[50%_45%]"
      />
    </picture>
  );
}
