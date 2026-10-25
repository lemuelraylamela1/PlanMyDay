"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import {
  fairytaleMedia,
  type FairytaleGalleryImage,
  type MediaOrientation,
} from "@/features/invitations/components/fairytale/fairytale-media";

/** Asymmetric placements: a 6-column rhythm on phones, a 12-column editorial spread on desktop. */
const slotLayouts = [
  "col-span-5 col-start-1 md:col-span-5 md:col-start-1",
  "col-span-4 col-start-3 md:col-span-6 md:col-start-7 md:mt-28",
  "col-span-6 md:col-span-7 md:col-start-2 md:mt-24",
  "col-span-3 col-start-1 md:col-span-3 md:col-start-10 md:mt-48",
  "col-span-3 col-start-4 mt-12 md:col-span-4 md:col-start-3 md:mt-20",
  "col-span-5 col-start-2 md:col-span-5 md:col-start-8 md:mt-40",
];

const aspectByOrientation: Record<MediaOrientation, string> = {
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
  square: "aspect-square",
};

const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function GalleryChapter() {
  const reveal = useReveal();

  return (
    <section className="relative px-5 py-28 sm:px-10 sm:py-36" style={{ backgroundImage: pageParchment }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#B76E79]")}>
            A gallery
          </motion.p>
          <motion.h2
            {...reveal(0.15, 28)}
            className={cn(displayFont, "mt-5 text-4xl font-light text-[#4a3236] sm:text-6xl")}
          >
            Moments, kept close
          </motion.h2>
        </div>

        <div className="mt-20 grid grid-cols-6 gap-x-4 gap-y-10 md:grid-cols-12 md:gap-x-6 md:gap-y-0">
          {fairytaleMedia.gallery.map((item, index) => (
            <GallerySlot
              key={item.src ?? `slot-${index}`}
              item={item}
              index={index}
              layout={slotLayouts[index % slotLayouts.length] ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySlot({ item, index, layout }: { item: FairytaleGalleryImage; index: number; layout: string }) {
  const reduceMotion = useReducedMotion();
  const delay = (index % 2) * 0.12;

  return (
    <motion.figure
      className={cn("group relative", layout)}
      initial={reduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: fairytaleEase, delay }}
    >
      <motion.div
        className={cn(
          "relative overflow-hidden bg-[#efe5d6] shadow-[0_18px_40px_-24px_rgba(74,50,54,0.45)] transition-transform duration-700 ease-out group-hover:-translate-y-1",
          aspectByOrientation[item.orientation],
        )}
        initial={reduceMotion ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: fairytaleEase, delay: delay + 0.1 }}
      >
        {item.src ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(min-width: 768px) 45vw, 85vw"
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <SlotPlaceholder numeral={numerals[index] ?? String(index + 1)} />
        )}
      </motion.div>
      {item.caption && (
        <figcaption className={cn(smallCaps, "mt-4 text-[#9b7b62]")}>{item.caption}</figcaption>
      )}
    </motion.figure>
  );
}

function SlotPlaceholder({ numeral }: { numeral: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,253,248,0.9), transparent 75%), linear-gradient(180deg,#f3e9da,#eadcc6)",
      }}
    >
      <span aria-hidden className="absolute inset-3 border border-[#DDBF8D]/55" />
      <span className={cn(displayFont, "text-4xl font-light text-[#B76E79]/55")}>{numeral}</span>
      <span className={cn(smallCaps, "mt-3 text-[9px] text-[#9b7b62]/70")}>Photograph to come</span>
    </div>
  );
}
