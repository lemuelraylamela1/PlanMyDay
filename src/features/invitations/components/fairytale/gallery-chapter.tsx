"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useParallaxY,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import { GoldDivider, displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleMedia, type FairytaleGalleryImage } from "@/features/invitations/components/fairytale/fairytale-media";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
import { SceneTransition } from "@/features/invitations/components/fairytale/scene-transition";

/**
 * Editorial mosaic spans — asymmetric luxury layout, not a uniform grid.
 * Pattern repeats for longer galleries without forcing equal cells.
 */
const tileSpans = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
];

const overlayCopy = [
  "At the carriage",
  "Soft light",
  "Hand in hand",
  "Fernwood gardens",
  "Looking back",
  "Nearly there",
  "Beneath the trees",
  "Stepping down",
  "Together",
  "Walking home",
];

export function GalleryChapter() {
  const reveal = useReveal();
  const sectionRef = React.useRef<HTMLElement>(null);
  const progress = useChapterScroll(sectionRef);
  const photos = fairytaleMedia.prenup.filter((photo) => Boolean(photo.src));
  const [active, setActive] = React.useState<number | null>(null);
  const feature = photos[0];
  const mosaic = photos.slice(1);

  return (
    <section
      id="prenup"
      ref={sectionRef}
      data-scene="gallery"
      className="relative scroll-mt-16 overflow-x-clip px-4 py-20 sm:scroll-mt-20 sm:px-8 sm:py-32"
      style={{ backgroundImage: pageParchment }}
    >
      <SceneTransition tone="gallery" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 40% at 80% 10%, rgba(201,184,232,0.14), transparent 70%)",
        }}
      />
      <div data-scene-content className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
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
            className={cn(displayFont, "mt-4 text-base italic leading-relaxed text-[#6d4a50] sm:text-lg")}
          >
            An editorial of quiet looks, shared laughter, and the day we began counting down—captured in soft light.
          </motion.p>
          <motion.div {...reveal(0.3)} className="mt-8">
            <GoldDivider />
          </motion.div>
        </div>

        {feature?.src && (
          <FeaturePlate
            item={feature}
            progress={progress}
            label={overlayCopy[0] ?? feature.alt}
            onOpen={() => setActive(0)}
          />
        )}

        <div className="mt-5 grid grid-cols-2 grid-flow-dense auto-rows-[10rem] gap-2.5 sm:mt-6 sm:auto-rows-[11.5rem] sm:gap-4 md:auto-rows-[13.5rem] md:grid-cols-4">
          {mosaic.map((item, mosaicIndex) => {
            const index = mosaicIndex + 1;
            return (
              <GalleryTile
                key={item.src ?? index}
                item={item}
                index={index}
                span={tileSpans[mosaicIndex % tileSpans.length] ?? "col-span-1 row-span-1"}
                overlay={overlayCopy[index] ?? item.alt}
                onOpen={() => setActive(index)}
              />
            );
          })}
        </div>

        <ChapterContinue href="#countdown" className="mx-auto mt-14" revealProps={reveal(0.15, 12)}>
          Continue
        </ChapterContinue>
      </div>

      <PhotoLightbox photos={photos} active={active} onChange={setActive} />
    </section>
  );
}

function FeaturePlate({
  item,
  progress,
  label,
  onOpen,
}: {
  item: FairytaleGalleryImage;
  progress: ReturnType<typeof useChapterScroll>;
  label: string;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const imageY = useParallaxY(progress, "-4%", "5%");

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`View photo: ${item.alt}`}
      className="group relative mt-12 block w-full overflow-hidden bg-[#22243A] text-left outline outline-1 outline-[#DDBF8D]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E79] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF8] sm:mt-16"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: fairytaleEase }}
    >
      <div className="relative aspect-[5/3] w-full overflow-hidden sm:aspect-[21/9]">
        <motion.div
          className="absolute inset-x-0 bottom-[-6%] top-[-6%]"
          style={
            {
              ...(reduceMotion ? {} : { y: imageY }),
              "--mobile-position": item.mobileObjectPosition ?? "50% 40%",
              "--desktop-position": item.objectPosition ?? "50% 45%",
            } as React.CSSProperties
          }
        >
          <Image
            src={item.src!}
            alt={item.alt}
            fill
            sizes="(min-width: 1024px) 72rem, 100vw"
            quality={82}
            className="object-cover [object-position:var(--mobile-position)] transition-transform duration-[1.35s] ease-out motion-safe:group-hover:scale-[1.025] sm:[object-position:var(--desktop-position)]"
          />
        </motion.div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,36,58,0.55)_0%,transparent_48%),linear-gradient(180deg,transparent_40%,rgba(34,36,58,0.62)_100%)] opacity-80 transition-opacity duration-700 group-hover:opacity-95"
        />
        <span className="absolute inset-x-0 bottom-0 flex flex-col items-start px-5 py-5 sm:px-8 sm:py-7">
          <span className={cn(smallCaps, "text-[#E8D4A8]/85")}>Featured frame</span>
          <span className={cn(displayFont, "mt-2 text-2xl font-light italic text-[#F8EFE2] sm:text-3xl")}>
            {label}
          </span>
        </span>
      </div>
    </motion.button>
  );
}

function GalleryTile({
  item,
  index,
  span,
  overlay,
  onOpen,
}: {
  item: FairytaleGalleryImage;
  index: number;
  span: string;
  overlay: string;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isLarge = span.includes("row-span-2") || span.includes("col-span-2");

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`View photo ${index + 1}: ${item.alt}`}
      className={cn(
        "group relative min-h-0 overflow-hidden bg-[#22243A] text-left outline outline-1 outline-[#DDBF8D]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B76E79] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF8]",
        span,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: fairytaleEase, delay: (index % 5) * 0.06 }}
    >
      {item.src && (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(min-width: 768px) 40vw, 80vw"
          quality={78}
          style={
            {
              "--mobile-position": item.mobileObjectPosition ?? "50% 40%",
              "--desktop-position": item.objectPosition ?? "50% 45%",
            } as React.CSSProperties
          }
          className="object-cover [object-position:var(--mobile-position)] transition-transform duration-[1.15s] ease-out motion-safe:group-hover:scale-[1.03] sm:[object-position:var(--desktop-position)]"
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(34,36,58,0.55)_100%)] opacity-70 transition-opacity duration-500 group-hover:opacity-90"
      />
      <span
        className={cn(
          "invite-hover-reveal pointer-events-none absolute inset-x-0 bottom-0 px-3 py-3 transition-[opacity,transform] duration-500 ease-out sm:px-4",
          isLarge && "invite-hover-reveal-strong",
        )}
      >
        <span className={cn(displayFont, "block text-sm font-light italic text-[#F8EFE2] sm:text-base")}>
          {overlay}
        </span>
        {item.caption && (
          <span className={cn(smallCaps, "mt-1 block text-[9px] text-[#E8D4A8]/75")}>
            Plate {item.caption}
          </span>
        )}
      </span>
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

  const crossfade = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.7, ease: fairytaleEase };

  return (
    <AnimatePresence>
      {photo?.src && active !== null && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1a1c2e]/96 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.4, ease: fairytaleEase }}
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
          onClick={() => onChange(null)}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(232,212,168,0.08),transparent_70%)]"
          />

          <button
            type="button"
            onClick={() => onChange(null)}
            className={cn(
              smallCaps,
              "absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 text-[#F3E7D3] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
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

          <div
            className="relative flex h-[min(82svh,52rem)] w-full max-w-5xl flex-col items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-full w-full">
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={photo.src}
                  className="absolute inset-0"
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.992 }}
                  transition={crossfade}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="100vw"
                    quality={88}
                    priority
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              key={`meta-${photo.src}`}
              className="mt-5 flex max-w-xl flex-col items-center text-center"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: fairytaleEase, delay: 0.08 }}
            >
              <p className={cn(displayFont, "text-base font-light italic text-[#F3E7D3] sm:text-lg")}>
                {overlayCopy[active] ?? photo.alt}
              </p>
              <p className={cn(smallCaps, "mt-3 text-[#E8D4A8]/70")}>
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </p>
            </motion.div>
          </div>
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
        "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#DDBF8D]/45 text-2xl text-[#F3E7D3] transition-[border-color,background-color] duration-300 hover:border-[#DDBF8D] hover:bg-[#F3E7D3]/05 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
        side === "left"
          ? "left-[max(0.75rem,env(safe-area-inset-left))]"
          : "right-[max(0.75rem,env(safe-area-inset-right))]",
      )}
    >
      <span aria-hidden>{side === "left" ? "‹" : "›"}</span>
    </button>
  );
}
