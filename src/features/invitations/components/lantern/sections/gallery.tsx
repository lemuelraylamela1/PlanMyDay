"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";

import { InfiniteSlider } from "@/components/ui/infinite-slider-horizontal";
import { SectionHeading } from "../ui/section-heading";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";
import {
  useLanternPerf,
  useMainEffectsActive,
} from "../performance/lantern-perf-provider";
import { useNearViewport } from "../hooks/use-near-viewport";
import { galleryImages, gallerySets, type GalleryImage } from "../media";

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

function GallerySlide({
  image,
  size,
  onOpen,
}: {
  image: GalleryImage;
  size: number;
  onOpen: (image: GalleryImage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      className="group relative shrink-0 overflow-hidden rounded-xl border border-[#2a1540]/10 bg-white/40 text-left shadow-[0_10px_28px_rgb(42_21_64_/_0.12)] outline-none transition hover:border-[#2a1540]/25 focus-visible:ring-2 focus-visible:ring-[#2a1540]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7efe8]"
      style={{ width: size, height: Math.round(size * (2 / 3)) }}
      aria-label={`View ${image.caption}`}
    >
      <Image
        src={image.src}
        alt={image.caption}
        width={1920}
        height={1280}
        sizes={`${size}px`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        draggable={false}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120814]/70 to-transparent px-2.5 pb-2 pt-8 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="block truncate font-cinzel text-[9px] font-semibold uppercase tracking-[0.22em] text-white/90">
          {image.caption}
        </span>
      </span>
    </button>
  );
}

type GalleryRow = {
  id: string;
  images: GalleryImage[];
  reverse?: boolean;
  duration: number;
};

export function Gallery() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { compact } = useLanternPerf();
  const effectsActive = useMainEffectsActive();
  const stageRef = React.useRef<HTMLDivElement>(null);
  const near = useNearViewport(stageRef, { enabled: effectsActive });
  const [rows, setRows] = React.useState<GalleryRow[]>(() =>
    gallerySets.map((set, index) => ({
      id: set.id,
      images: set.images,
      reverse: index % 2 === 1,
      duration: 28 + index * 4,
    })),
  );
  const [lightbox, setLightbox] = React.useState<LightboxItem | null>(null);
  const showGallery = effectsActive && near;

  React.useEffect(() => {
    setRows(
      gallerySets.map((set, index) => ({
        id: set.id,
        images: shuffle(set.images),
        reverse: index % 2 === 1,
        duration: 28 + index * 4,
      })),
    );
  }, []);

  const cardSize = compact ? 168 : 220;
  const gap = compact ? 12 : 16;

  const openPhoto = React.useCallback((image: GalleryImage) => {
    setLightbox({
      image: image.src,
      text: image.caption,
      alt: image.caption,
    });
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
        aria-label="Photo gallery"
      >
        {showGallery ? (
          <div className="flex flex-col justify-center gap-3 sm:gap-4">
            {rows.map((row) => (
              <InfiniteSlider
                key={row.id}
                direction="horizontal"
                reverse={row.reverse}
                gap={gap}
                duration={reduceMotion ? 120 : row.duration}
                durationOnHover={reduceMotion ? undefined : row.duration * 2.4}
                draggable
                className="w-full"
              >
                {row.images.map((image) => (
                  <GallerySlide
                    key={`${row.id}-${image.src}`}
                    image={image}
                    size={cardSize}
                    onOpen={openPhoto}
                  />
                ))}
              </InfiniteSlider>
            ))}
          </div>
        ) : (
          <div
            className="w-full"
            style={{ height: compact ? cardSize * 2 : cardSize * 2.2 }}
            aria-hidden
          />
        )}
      </div>

      <p className="relative z-10 mt-5 text-center font-cinzel text-[9px] font-semibold uppercase tracking-[0.28em] text-[#2a1540]/45 sm:mt-6">
        Drag to find a photo · tap for full size · {galleryImages.length} photographs
      </p>

      {lightbox ? (
        <GalleryLightbox item={lightbox} onClose={() => setLightbox(null)} />
      ) : null}
    </section>
  );
}
