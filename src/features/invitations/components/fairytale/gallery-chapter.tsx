"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleMedia, type FairytaleGalleryImage } from "@/features/invitations/components/fairytale/fairytale-media";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";

/** Stable grid cells. CSS columns were dropping absolutely positioned photos. */
const tileSpans = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
];

export function GalleryChapter() {
  const reveal = useReveal();
  const photos = fairytaleMedia.prenup.filter((photo) => Boolean(photo.src));
  const [active, setActive] = React.useState<number | null>(null);

  return (
    <section
      id="prenup"
      className="relative overflow-x-clip px-4 py-24 sm:px-8 sm:py-32"
      style={{ backgroundImage: pageParchment }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 40% at 80% 10%, rgba(201,184,232,0.14), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#B76E79]")}>
            Our prenup
          </motion.p>
          <motion.h2
            {...reveal(0.12, 20)}
            className={cn(displayFont, "mt-4 text-3xl font-light tracking-[-0.02em] text-[#4a3236] sm:text-5xl")}
          >
            Moments before forever
          </motion.h2>
          <motion.p
            {...reveal(0.22)}
            className={cn(displayFont, "mt-4 text-base italic text-[#6d4a50] sm:text-lg")}
          >
            Quiet looks, shared laughter, and the day we began counting down.
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-2 grid-flow-dense auto-rows-[9.5rem] gap-3 sm:mt-16 sm:auto-rows-[12rem] sm:gap-4 md:auto-rows-[14rem]">
          {photos.map((item, index) => (
            <GalleryTile
              key={item.src ?? index}
              item={item}
              index={index}
              span={tileSpans[index % tileSpans.length] ?? "col-span-1 row-span-1"}
              onOpen={() => setActive(index)}
            />
          ))}
        </div>

        <ChapterContinue href="#countdown" className="mx-auto mt-14" revealProps={reveal(0.15, 12)}>
          Continue
        </ChapterContinue>
      </div>

      <PhotoLightbox photos={photos} active={active} onChange={setActive} />
    </section>
  );
}

function GalleryTile({
  item,
  index,
  span,
  onOpen,
}: {
  item: FairytaleGalleryImage;
  index: number;
  span: string;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`View photo ${index + 1}: ${item.alt}`}
      className={cn(
        "group relative min-h-0 overflow-hidden bg-[#22243A] text-left outline outline-1 outline-[#DDBF8D]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E79] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF8]",
        span,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: fairytaleEase, delay: (index % 4) * 0.05 }}
    >
      {item.src && (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(min-width: 768px) 40vw, 80vw"
          quality={78}
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(34,36,58,0.35)_100%)] opacity-60 transition-opacity duration-500 group-hover:opacity-90"
      />
    </motion.button>
  );
}

function PhotoLightbox({
  photos,
  active,
  onChange,
}: {
  photos: FairytaleGalleryImage[];
  active: number | null;
  onChange: (index: number | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const count = photos.length;
  const photo = active === null ? null : photos[active];

  const go = React.useCallback(
    (step: number) => {
      if (active === null || count === 0) return;
      onChange((active + step + count) % count);
    },
    [active, count, onChange],
  );

  React.useEffect(() => {
    if (active === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onChange(null);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, go, onChange]);

  return (
    <AnimatePresence>
      {photo?.src && active !== null && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#22243A]/94 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
          onClick={() => onChange(null)}
        >
          <button
            type="button"
            onClick={() => onChange(null)}
            className={cn(
              smallCaps,
              "absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 text-[#F3E7D3] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
            )}
          >
            Close
          </button>

          {count > 1 && (
            <>
              <LightboxArrow label="Previous photo" side="left" onClick={() => go(-1)} />
              <LightboxArrow label="Next photo" side="right" onClick={() => go(1)} />
            </>
          )}

          <motion.div
            key={photo.src}
            className="relative h-[min(82svh,52rem)] w-full max-w-5xl"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: fairytaleEase }}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              quality={85}
              priority
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LightboxArrow({
  label,
  side,
  onClick,
}: {
  label: string;
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-[#DDBF8D]/50 text-2xl text-[#F3E7D3] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
        side === "left"
          ? "left-[max(0.75rem,env(safe-area-inset-left))]"
          : "right-[max(0.75rem,env(safe-area-inset-right))]",
      )}
    >
      <span aria-hidden>{side === "left" ? "‹" : "›"}</span>
    </button>
  );
}
