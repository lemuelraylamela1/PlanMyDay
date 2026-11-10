"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { SectionHeading } from "../ui/section-heading";
import CircularGallery from "../ui/CircularGallery";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";
import {
  useLanternPerf,
  useMainEffectsActive,
} from "../performance/lantern-perf-provider";
import { useNearViewport } from "../hooks/use-near-viewport";
import { galleryImages } from "../media";

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i] as T;
    const b = next[j] as T;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

function toGalleryItems(list: typeof galleryImages) {
  return list.map((img) => ({
    image: img.src,
    text: img.caption,
    alt: img.caption,
  }));
}

export function Gallery() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { profile, compact } = useLanternPerf();
  const effectsActive = useMainEffectsActive();
  const stageRef = React.useRef<HTMLDivElement>(null);
  const near = useNearViewport(stageRef, { enabled: effectsActive });
  // Stable order for SSR; shuffle only after mount to avoid hydration mismatch.
  const [items, setItems] = React.useState(() => toGalleryItems(galleryImages));
  const showGallery = effectsActive && near;

  React.useEffect(() => {
    setItems(toGalleryItems(shuffle(galleryImages)));
  }, []);

  return (
    <section
      id="gallery"
      className="relative overflow-hidden lantern-section cream-section"
      style={{
        background:
          "linear-gradient(180deg, #f7efe8 0%, #f3e4ea 48%, #f8f1eb 100%)",
        color: "#2a1540",
      }}
    >
      <MagicDust count={16} intensity="soft" className="opacity-35" />
      <SceneAtmosphere tone="warm" className="opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.gallery.eyebrow}
          title={wedding.gallery.title}
          intro={wedding.gallery.intro}
          theme="light"
        />
      </div>

      <div
        ref={stageRef}
        className="relative z-10 mt-8 w-full sm:mt-10"
        style={{
          height: compact ? "min(68vw, 420px)" : "560px",
          position: "relative",
        }}
        aria-label="Photo gallery"
      >
        {showGallery ? (
          <CircularGallery
            items={items}
            bend={compact ? 2 : 3}
            textColor="#2a1540"
            borderRadius={0.05}
            scrollEase={0.05}
            snap
            showTitles
            openOnClick
            autoScroll={reduceMotion ? 0 : compact ? 0.28 : 0.35}
            intro={!reduceMotion}
            itemSize={compact ? 1.12 : 1}
            font={
              compact
                ? 'bold 22px "Cormorant Garamond", Georgia, serif'
                : 'bold 28px "Cormorant Garamond", Georgia, serif'
            }
            dpr={profile.maxDpr}
          />
        ) : null}
      </div>

      <p className="relative z-10 mt-5 text-center font-cinzel text-[9px] font-semibold uppercase tracking-[0.28em] text-[#2a1540]/45 sm:mt-6">
        {items.length} photographs
      </p>
    </section>
  );
}
