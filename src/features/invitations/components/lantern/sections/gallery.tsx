"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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

const SWIPE_OFFSET = 72;
const SWIPE_VELOCITY = 450;

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function GalleryLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const onCloseRef = React.useRef(onClose);
  const onIndexChangeRef = React.useRef(onIndexChange);
  const indexRef = React.useRef(index);
  const [direction, setDirection] = React.useState(0);

  onCloseRef.current = onClose;
  onIndexChangeRef.current = onIndexChange;
  indexRef.current = index;

  const item = images[index];
  const count = images.length;

  const goTo = React.useCallback(
    (nextIndex: number, dir: number) => {
      setDirection(dir);
      onIndexChangeRef.current(wrapIndex(nextIndex, count));
    },
    [count],
  );

  const goPrev = React.useCallback(() => goTo(indexRef.current - 1, -1), [goTo]);
  const goNext = React.useCallback(() => goTo(indexRef.current + 1, 1), [goTo]);

  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goPrev, goNext]);

  // Prefetch neighbors for snappy swipes.
  React.useEffect(() => {
    if (count < 2) return;
    const neighbors = [
      images[wrapIndex(index - 1, count)],
      images[wrapIndex(index + 1, count)],
    ];
    for (const neighbor of neighbors) {
      if (!neighbor) continue;
      const img = new window.Image();
      img.src = neighbor.src;
    }
  }, [images, index, count]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) {
      goNext();
      return;
    }
    if (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY) {
      goPrev();
    }
  };

  if (!item) return null;

  const slideVariants = {
    enter: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? 72 : -72,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? -56 : 56,
      opacity: 0,
    }),
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex touch-none items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || "Photograph gallery"}
      onClick={onClose}
      onPointerUp={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Blur + dim the gallery behind the fullscreen photo. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#120814]/72 backdrop-blur-2xl backdrop-saturate-150"
        onClick={onClose}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#120814]/45 via-transparent to-[#120814]/55"
      />

      <button
        ref={closeRef}
        type="button"
        className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 sm:top-5"
        aria-label="Close photo"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4 sm:grid"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4 sm:grid"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div
        className="relative z-10 flex h-full w-full max-w-[min(96vw,1400px)] flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.figure
            key={item.src}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: reduceMotion ? 0.01 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            className="relative flex max-h-full w-full cursor-grab flex-col items-center gap-3 active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- fullscreen HD source, not a layout image */}
            <img
              src={item.src}
              alt={item.caption || "Wedding photograph"}
              decoding="async"
              className="max-h-[min(84dvh,920px)] max-w-full select-none object-contain"
              style={{
                width: "auto",
                height: "auto",
                imageRendering: "auto",
                touchAction: "none",
              }}
              draggable={false}
            />
            <figcaption className="flex max-w-[min(90vw,36rem)] flex-col items-center gap-1.5 text-center">
              {item.caption ? (
                <span className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                  {item.caption}
                </span>
              ) : null}
              <span className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">
                {index + 1} / {count}
                {count > 1 ? " · swipe for more" : null}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
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
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
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

  const photos = React.useMemo(() => {
    const seen = new Set<string>();
    const list: GalleryImage[] = [];
    for (const row of rows) {
      for (const image of row.images) {
        if (seen.has(image.src)) continue;
        seen.add(image.src);
        list.push(image);
      }
    }
    return list.length > 0 ? list : galleryImages;
  }, [rows]);

  const cardSize = compact ? 168 : 220;
  const gap = compact ? 12 : 16;

  const openPhoto = React.useCallback(
    (image: GalleryImage) => {
      const found = photos.findIndex((photo) => photo.src === image.src);
      setLightboxIndex(found >= 0 ? found : 0);
    },
    [photos],
  );

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
        Drag to find · tap to open · swipe in fullscreen · {photos.length}{" "}
        photographs
      </p>

      {lightboxIndex !== null ? (
        <GalleryLightbox
          images={photos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </section>
  );
}
