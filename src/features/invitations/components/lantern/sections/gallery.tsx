"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";
import { cn } from "@/lib/utils";
import { MagicDust } from "../effects/magic-dust";
import { useLanternContent } from "../content-context";
import { galleryImages } from "../media";

const GRADIENTS = [
  "from-[#f7e3e8] to-[#e8b8c7]",
  "from-[#fbeede] to-[#ddbf8d]",
  "from-[#f5c0cf] to-[#e8829a]",
  "from-[#fdf6ec] to-[#f7e3e8]",
  "from-[#f7e3e8] to-[#ddbf8d]",
  "from-[#f0d3da] to-[#e8b8c7]",
  "from-[#fbeede] to-[#e8b8c7]",
  "from-[#fce8ef] to-[#ddbf8d]",
];

const SPANS = [
  "row-span-2",
  "row-span-1",
  "row-span-1",
  "row-span-2",
  "row-span-1",
  "row-span-2",
  "row-span-1",
  "row-span-1",
];

function PhotoTile({
  src,
  caption,
  index,
  className,
  onOpen,
}: {
  src: string;
  caption: string;
  index: number;
  className?: string;
  onOpen: () => void;
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-lantern-rose/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lantern",
        className
      )}
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={caption}
          className="h-full min-h-[10rem] w-full object-cover object-[center_32%] transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-105 sm:object-center"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            "flex h-full min-h-[10rem] w-full items-center justify-center bg-gradient-to-br transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-105",
            GRADIENTS[index % GRADIENTS.length]
          )}
        >
          <span className="font-serif text-sm italic text-lantern-rose/60">{caption}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-night/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute bottom-3 left-4 right-4 text-left font-serif text-sm italic text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {caption}
      </span>
    </button>
  );
}

export function Gallery() {
  const wedding = useLanternContent();
  const items: { src: string; caption: string }[] =
    galleryImages.length > 0
      ? galleryImages
      : Array.from({ length: wedding.gallery.placeholderCount }, (_, i) => ({
          src: "",
          caption:
            wedding.gallery.captions[i % wedding.gallery.captions.length] ?? "Memory",
        }));

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = React.useState(0);
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const closeLightbox = React.useCallback(() => setLightbox(null), []);
  const navLightbox = React.useCallback(
    (dir: number) =>
      setLightbox((cur) =>
        cur === null ? null : (cur + dir + items.length) % items.length
      ),
    [items.length]
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
      className="relative overflow-hidden lantern-section"
      style={{ backgroundColor: "var(--color-cream-dark)" }}
    >
      <MagicDust count={18} intensity="soft" className="opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "linear-gradient(180deg, rgba(45,27,94,0.08), transparent)" }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.gallery.eyebrow}
          title={wedding.gallery.title}
          intro={wedding.gallery.intro}
          theme="light"
        />

        <Reveal className="mt-14">
          <div className="relative">
            <div className="storybook-panel overflow-hidden rounded-3xl p-2" ref={emblaRef}>
              <div className="flex">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="min-w-0 flex-[0_0_85%] pl-4 first:pl-0 sm:flex-[0_0_60%]"
                  >
                    <PhotoTile
                      src={it.src}
                      caption={it.caption}
                      index={idx}
                      className="h-72 sm:h-96"
                      onOpen={() => setLightbox(idx)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-lantern/40 bg-cream/80 text-ink backdrop-blur-sm transition hover:bg-cream"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-lantern/40 bg-cream/80 text-ink backdrop-blur-sm transition hover:bg-cream"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-5 flex justify-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    selected === i ? "w-6 bg-lantern-rose" : "w-2 bg-lantern-rose/30"
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <div className="grid auto-rows-[8rem] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it, i) => (
              <PhotoTile
                key={i}
                src={it.src}
                caption={it.caption}
                index={i}
                className={cn("h-full", SPANS[i % SPANS.length])}
                onOpen={() => setLightbox(i)}
              />
            ))}
          </div>
        </Reveal>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-night/80 p-3 backdrop-blur-md sm:p-6"
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
              onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}
              className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-night/40 text-cream sm:left-8 sm:h-12 sm:w-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <motion.div
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex aspect-[3/4] w-full max-w-3xl items-center justify-center overflow-hidden rounded-2xl shadow-2xl sm:aspect-[4/3]"
            >
              {(() => {
                const active = items[lightbox];
                if (!active) return null;
                return active.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.src}
                    alt={active.caption}
                    className="h-full w-full object-cover object-[center_35%] sm:object-center"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-full w-full items-center justify-center bg-gradient-to-br",
                      GRADIENTS[lightbox % GRADIENTS.length],
                    )}
                  >
                    <p className="font-serif text-xl italic text-ink">{active.caption}</p>
                  </div>
                );
              })()}
            </motion.div>
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => { e.stopPropagation(); navLightbox(1); }}
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
