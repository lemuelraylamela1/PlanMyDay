"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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

type LightboxItem = {
  image: string;
  text?: string;
  alt?: string;
};

function GalleryLightbox({
  item,
  onClose,
}: {
  item: LightboxItem;
  onClose: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex touch-none items-center justify-center bg-[#120814]/92 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.text || item.alt || "Photograph"}
      onClick={onClose}
      onPointerUp={(event) => {
        // Mobile: treat backdrop release as close even if click is suppressed.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 sm:top-5"
        aria-label="Close photo"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M4 4l10 10M14 4L4 14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <figure
        className="relative flex max-h-full max-w-full flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- fullscreen HD source, not a layout image */}
        <img
          src={item.image}
          alt={item.alt || item.text || "Wedding photograph"}
          decoding="async"
          className="max-h-[min(92dvh,920px)] max-w-[min(96vw,1400px)] object-contain select-none"
          style={{
            width: "auto",
            height: "auto",
            imageRendering: "auto",
          }}
          draggable={false}
        />
        {item.text ? (
          <figcaption className="max-w-[min(90vw,36rem)] text-center font-cinzel text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
            {item.text}
          </figcaption>
        ) : null}
      </figure>
    </div>,
    document.body,
  );
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
  const [lightbox, setLightbox] = React.useState<LightboxItem | null>(null);
  const showGallery = effectsActive && near;
  // Keep carousel sharp on retina phones even when the global perf profile caps DPR.
  const galleryDpr = Math.min(2, Math.max(profile.maxDpr, compact ? 2 : profile.maxDpr));

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
            openOnClick={false}
            onItemClick={(item: LightboxItem) => setLightbox(item)}
            autoScroll={reduceMotion ? 0 : compact ? 0.28 : 0.35}
            intro={!reduceMotion}
            itemSize={compact ? 1.12 : 1}
            font={
              compact
                ? 'bold 22px "Cormorant Garamond", Georgia, serif'
                : 'bold 28px "Cormorant Garamond", Georgia, serif'
            }
            dpr={galleryDpr}
          />
        ) : null}
      </div>

      <p className="relative z-10 mt-5 text-center font-cinzel text-[9px] font-semibold uppercase tracking-[0.28em] text-[#2a1540]/45 sm:mt-6">
        {items.length} photographs
      </p>

      {lightbox ? (
        <GalleryLightbox item={lightbox} onClose={() => setLightbox(null)} />
      ) : null}
    </section>
  );
}
