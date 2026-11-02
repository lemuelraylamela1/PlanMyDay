"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "../ui/section-heading";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";
import { galleryImages } from "../media";

const LUXURY = [0.16, 1, 0.3, 1] as const;

/** Varied masonry spans for a collage feel. */
const MOSAIC = [
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-2",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-2 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-2",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
] as const;

function GalleryTile({
  src,
  caption,
  className,
  sizes,
  priority,
  onOpen,
}: {
  src: string;
  caption: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative isolate overflow-hidden rounded-[1.35rem] border border-lantern-rose/15 bg-cream/40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lantern",
        className,
      )}
    >
      <Image
        src={src}
        alt={caption}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover object-[center_32%] transition duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.05] sm:object-center"
      />
    </button>
  );
}

export function Gallery() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.25 });

  const items =
    galleryImages.length > 0
      ? galleryImages
      : Array.from({ length: wedding.gallery.placeholderCount }, (_, i) => ({
          src: "/proposal-photos/hero-01.jpg",
          caption:
            wedding.gallery.captions[i % wedding.gallery.captions.length] ??
            "Memory",
        }));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });
  const [selected, setSelected] = React.useState(0);
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Gentle autoplay while the gallery is on screen.
  React.useEffect(() => {
    if (!emblaApi || reduceMotion || !inView || lightbox !== null) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), 4200);
    return () => window.clearInterval(id);
  }, [emblaApi, reduceMotion, inView, lightbox]);

  const closeLightbox = React.useCallback(() => setLightbox(null), []);
  const navLightbox = React.useCallback(
    (dir: number) =>
      setLightbox((cur) =>
        cur === null ? null : (cur + dir + items.length) % items.length,
      ),
    [items.length],
  );

  React.useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navLightbox(1);
      if (e.key === "ArrowLeft") navLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox, navLightbox]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative overflow-hidden lantern-section"
      style={{
        background:
          "linear-gradient(180deg, #f7efe8 0%, #f3e4ea 48%, #f8f1eb 100%)",
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

        {/* Cinematic spotlight carousel */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: LUXURY }}
          className="relative mt-10 sm:mt-14"
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {items.map((item, index) => {
                const active = index === selected;
                return (
                  <div
                    key={`spotlight-${item.src}-${index}`}
                    className="min-w-0 flex-[0_0_88%] px-2 sm:flex-[0_0_72%] sm:px-3 lg:flex-[0_0_62%]"
                  >
                    <button
                      type="button"
                      onClick={() => setLightbox(index)}
                      className={cn(
                        "relative block aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-lantern-rose/20 shadow-[0_30px_70px_-42px_rgba(96,40,60,0.55)] transition duration-700 sm:aspect-[16/11]",
                        active
                          ? "scale-100 opacity-100"
                          : "scale-[0.94] opacity-55",
                      )}
                    >
                      <Image
                        src={item.src}
                        alt={item.caption}
                        fill
                        sizes="(max-width: 1024px) 88vw, 62vw"
                        priority={index < 2}
                        className="object-cover object-[center_30%] sm:object-center"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-lantern/40 bg-cream/85 text-ink backdrop-blur-md transition hover:bg-cream sm:left-2 sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-lantern/40 bg-cream/85 text-ink backdrop-blur-md transition hover:bg-cream sm:right-2 sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-5 flex justify-center gap-2 sm:mt-6">
            {items.map((item, i) => (
              <button
                key={`dot-${item.src}-${i}`}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  selected === i
                    ? "w-7 bg-lantern-rose"
                    : "w-1.5 bg-lantern-rose/30 hover:bg-lantern-rose/55",
                )}
              />
            ))}
          </div>
        </motion.div>

        {/* Masonry / mosaic collage */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.95, ease: LUXURY, delay: 0.08 }}
          className="mt-10 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:mt-14 sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-4 lg:auto-rows-[13.5rem]"
        >
          {items.map((item, index) => (
            <GalleryTile
              key={`mosaic-${item.src}-${index}`}
              src={item.src}
              caption={item.caption}
              className={cn("min-h-[11rem]", MOSAIC[index % MOSAIC.length])}
              sizes="(max-width: 640px) 50vw, 25vw"
              onOpen={() => {
                setLightbox(index);
                emblaApi?.scrollTo(index);
              }}
            />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-night/82 p-3 backdrop-blur-md sm:p-6"
            style={{
              paddingTop: "max(0.75rem, env(safe-area-inset-top))",
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeLightbox}
              className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-night/50 text-cream sm:right-5 sm:top-5"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                navLightbox(-1);
              }}
              className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-night/40 text-cream sm:left-8 sm:h-12 sm:w-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <motion.div
              key={lightbox}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.4, ease: LUXURY }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] shadow-2xl"
            >
              <div className="relative aspect-[3/4] w-full sm:aspect-[16/11]">
                {items[lightbox] && (
                  <Image
                    src={items[lightbox].src}
                    alt={items[lightbox].caption}
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover object-[center_32%] sm:object-center"
                    priority
                  />
                )}
              </div>
            </motion.div>
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                navLightbox(1);
              }}
              className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-night/40 text-cream sm:right-8 sm:h-12 sm:w-12"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
