"use client";

import * as React from "react";
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

/** Varied heights so the column masonry feels natural, not a flat grid. */
const masonryHeight: Record<MediaOrientation, string> = {
  portrait: "h-[16rem] sm:h-[18rem] md:h-[20rem]",
  landscape: "h-[11rem] sm:h-[12.5rem] md:h-[13.5rem]",
  square: "h-[13.5rem] sm:h-[15rem] md:h-[16rem]",
};

export function GalleryChapter() {
  const reveal = useReveal();
  const photos = fairytaleMedia.prenup;

  return (
    <section
      id="prenup"
      className="relative overflow-x-clip px-5 py-20 sm:px-8 sm:py-28"
      style={{ backgroundImage: pageParchment }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#B76E79]")}>
            Our prenup
          </motion.p>
          <motion.h2
            {...reveal(0.12, 24)}
            className={cn(displayFont, "mt-4 text-3xl font-light text-[#4a3236] sm:text-5xl")}
          >
            Moments before forever
          </motion.h2>
          <motion.p
            {...reveal(0.22)}
            className={cn(displayFont, "mt-3 text-base italic text-[#6d4a50] sm:text-lg")}
          >
            Quiet looks, shared laughter, and the day we began counting down.
          </motion.p>
        </div>

        <div className="mt-10 columns-2 gap-2.5 sm:mt-12 sm:columns-3 sm:gap-3 md:columns-4 md:gap-3">
          {photos.map((item, index) => (
            <MasonryTile key={item.src ?? `tile-${index}`} item={item} index={index} />
          ))}
        </div>

        <motion.a
          {...reveal(0.15, 12)}
          href="#countdown"
          className={cn(
            smallCaps,
            "mx-auto mt-12 flex w-fit flex-col items-center gap-3 text-[#9b7b62] transition-colors hover:text-[#B76E79] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
          )}
        >
          Continue
          <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-[#DDBF8D]/40">
            <motion.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-[#B76E79]"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: fairytaleEase }}
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}

function MasonryTile({ item, index }: { item: FairytaleGalleryImage; index: number }) {
  const reduceMotion = useReducedMotion();
  const delay = (index % 4) * 0.06;

  return (
    <motion.figure
      className="group mb-2.5 break-inside-avoid sm:mb-3"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, ease: fairytaleEase, delay }}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[#efe5d6] shadow-[0_14px_32px_-22px_rgba(74,50,54,0.45)]",
          masonryHeight[item.orientation],
        )}
      >
        {item.src ? (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(min-width: 768px) 22vw, 45vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,253,248,0.9), transparent 75%), linear-gradient(180deg,#f3e9da,#eadcc6)",
            }}
          >
            <span className={cn(displayFont, "text-2xl font-light text-[#B76E79]/55")}>
              {item.caption ?? String(index + 1)}
            </span>
          </div>
        )}
      </div>
    </motion.figure>
  );
}
