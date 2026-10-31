"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useParallaxY,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import {
  Fleuron,
  GoldCorner,
  GoldDivider,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";
import { LanternField } from "@/features/invitations/components/fairytale/lanterns";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
import { SceneTransition } from "@/features/invitations/components/fairytale/scene-transition";
import type { InvitationWedding } from "@/features/invitations/components/fairytale/types";

/** Existing prenup frames used as venue atmosphere — never stock imagery. */
const venuePhoto =
  fairytaleMedia.prenup.find((photo) => photo.src?.includes("hero-08")) ??
  fairytaleMedia.prenup.find((photo) => Boolean(photo.src)) ??
  fairytaleMedia.hero[0];

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function InvitationChapter({ wedding }: { wedding: InvitationWedding }) {
  const reveal = useReveal();
  const reduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const progress = useChapterScroll(sectionRef);
  const imageY = useParallaxY(progress, "-5%", "6%");

  const schedule = [
    wedding.ceremonyTimeLabel && { label: "Ceremony", value: wedding.ceremonyTimeLabel },
    wedding.receptionTimeLabel && { label: "Reception", value: wedding.receptionTimeLabel },
  ].filter(Boolean) as { label: string; value: string }[];

  const hasVenue = Boolean(wedding.venueName || wedding.venueAddress);
  const directionsHref = wedding.venueAddress ? mapsUrl(wedding.venueAddress) : null;

  return (
    <section
      id="invitation"
      ref={sectionRef}
      data-scene="invitation"
      className="relative flex min-h-[100svh] scroll-mt-6 flex-col items-center overflow-hidden px-5 pb-24 pt-28 text-center sm:px-8 sm:pt-36"
      style={{ backgroundImage: pageParchment }}
    >
      <SceneTransition tone="paper" />
      <LanternField />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: fairytaleAtmosphere.champagneMist }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] top-[10%] h-56 opacity-55"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, rgba(201,184,232,0.16), transparent 70%), radial-gradient(ellipse at 70% 40%, rgba(232,212,168,0.18), transparent 68%)",
        }}
      />

      <div data-scene-content className="relative flex w-full max-w-5xl flex-col items-center">
        <motion.div {...reveal(0.08)} className="mb-8">
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -3, 0], opacity: [0.88, 1, 0.88] }}
            transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Fleuron className="w-24 text-[#C9A66B]" />
          </motion.div>
        </motion.div>

        <motion.p {...reveal(0.16)} className={cn(smallCaps, "text-[#B76E79]")}>
          The celebration
        </motion.p>

        <motion.h2
          {...reveal(0.26, 24)}
          className={cn(
            displayFont,
            "mt-6 max-w-2xl text-balance text-[clamp(2.1rem,6vw,3.5rem)] font-light leading-[1.05] tracking-[-0.02em] text-[#4a3236]",
          )}
        >
          Join us for a day of love, laughter, and forever after.
        </motion.h2>

        <motion.p
          {...reveal(0.38)}
          className={cn(
            displayFont,
            "mt-6 max-w-md text-balance text-lg italic leading-relaxed text-[#6d4a50] sm:text-xl",
          )}
        >
          Your presence is the greatest gift as we begin this new chapter together.
        </motion.p>

        <motion.div {...reveal(0.48)} className="mt-12">
          <GoldDivider />
        </motion.div>

        {/* Royal invitation plate */}
        <motion.div
          {...reveal(0.55, 20)}
          className="relative mt-14 w-full max-w-3xl px-6 py-12 sm:px-14 sm:py-16"
        >
          <GoldCorner className="left-1 top-1 sm:left-2 sm:top-2" />
          <GoldCorner className="right-1 top-1 rotate-90 sm:right-2 sm:top-2" />
          <GoldCorner className="bottom-1 left-1 -rotate-90 sm:bottom-2 sm:left-2" />
          <GoldCorner className="bottom-1 right-1 rotate-180 sm:bottom-2 sm:right-2" />

          <p className={cn(smallCaps, "text-[#9b7b62]")}>Request the honour of your presence</p>

          <p className={cn(scriptFont, "mt-6 text-[clamp(2.4rem,8vw,3.6rem)] leading-none text-[#B76E79]")}>
            {wedding.coupleNames}
          </p>

          {wedding.dateLabel && (
            <div className="mt-10">
              <p className={cn(smallCaps, "text-[#9b7b62]")}>On the day of</p>
              <p
                className={cn(
                  displayFont,
                  "mt-3 text-balance text-[clamp(1.55rem,4.5vw,2.15rem)] font-light leading-snug tracking-[-0.01em] text-[#4a3236]",
                )}
              >
                {wedding.dateLabel}
              </p>
            </div>
          )}

          {wedding.monogram && (
            <motion.p
              aria-hidden
              className={cn(scriptFont, "mt-10 text-3xl text-[#DDBF8D]/70")}
              animate={reduceMotion ? undefined : { opacity: [0.5, 0.78, 0.5] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {wedding.monogram}
            </motion.p>
          )}
        </motion.div>

        {/* Ceremony & reception schedule — editorial, not cards */}
        {schedule.length > 0 && (
          <div className="relative mt-16 w-full max-w-xl sm:mt-20">
            <motion.p {...reveal(0.1)} className={cn(smallCaps, "text-[#B76E79]")}>
              The day&apos;s rhythm
            </motion.p>
            <motion.h3
              {...reveal(0.18, 16)}
              className={cn(displayFont, "mt-3 text-3xl font-light text-[#4a3236] sm:text-4xl")}
            >
              Ceremony & reception
            </motion.h3>

            <div className="relative mt-12">
              <motion.span
                aria-hidden
                className="absolute bottom-2 left-1/2 top-2 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-[#DDBF8D]/80 via-[#E8B8C7]/45 to-transparent"
                initial={reduceMotion ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.6, ease: fairytaleEase }}
              />

              <ol className="space-y-14">
                {schedule.map((item, index) => (
                  <motion.li
                    key={item.label}
                    className="relative flex flex-col items-center px-4"
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.9, ease: fairytaleEase, delay: index * 0.08 }}
                  >
                    <span
                      aria-hidden
                      className="mb-5 h-3 w-3 rotate-45 border border-[#DDBF8D] bg-[#FFFDF8] shadow-[0_0_16px_rgba(221,191,141,0.35)]"
                    />
                    <p className={cn(smallCaps, "text-[#9b7b62]")}>{item.label}</p>
                    <p className={cn(displayFont, "mt-3 text-3xl font-light text-[#4a3236] sm:text-4xl")}>
                      {item.value}
                    </p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Venue photography + address + directions */}
        {hasVenue && (
          <div className="mt-20 w-full sm:mt-28">
            <motion.p {...reveal(0.08)} className={cn(smallCaps, "text-[#B76E79]")}>
              The setting
            </motion.p>
            <motion.h3
              {...reveal(0.16, 16)}
              className={cn(displayFont, "mt-3 text-3xl font-light text-[#4a3236] sm:text-4xl")}
            >
              Venue & directions
            </motion.h3>

            <motion.figure
              className="relative mx-auto mt-10 overflow-hidden sm:mt-12"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 1.1, ease: fairytaleEase }}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#22243A] sm:aspect-[21/9]">
                {venuePhoto?.src && (
                  <motion.div
                    className="absolute inset-x-0 bottom-[-7%] top-[-7%]"
                    style={reduceMotion ? undefined : { y: imageY }}
                  >
                    <Image
                      src={venuePhoto.src}
                      alt={venuePhoto.alt}
                      fill
                      sizes="(min-width: 1024px) 64rem, 100vw"
                      quality={82}
                      className="object-cover object-center"
                    />
                  </motion.div>
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(34,36,58,0.2)_0%,transparent_35%,rgba(34,36,58,0.78)_100%)]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 px-5 py-6 text-left sm:px-10 sm:py-8">
                  {wedding.venueName && (
                    <p className={cn(displayFont, "text-2xl font-light text-[#F8EFE2] sm:text-3xl")}>
                      {wedding.venueName}
                    </p>
                  )}
                  {wedding.venueAddress && (
                    <p className={cn(displayFont, "mt-2 max-w-xl text-sm italic leading-relaxed text-[#F3E7D3]/80 sm:text-base")}>
                      {wedding.venueAddress}
                    </p>
                  )}
                </figcaption>
              </div>
            </motion.figure>

            {directionsHref && (
              <motion.a
                {...reveal(0.2)}
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  smallCaps,
                  "mt-8 inline-flex flex-col items-center gap-2 text-[#9b7b62] transition-colors hover:text-[#B76E79] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
                )}
              >
                Open location & directions
                <span aria-hidden className="h-px w-16 bg-gradient-to-r from-transparent via-[#DDBF8D] to-transparent" />
              </motion.a>
            )}
          </div>
        )}

        {/* Dress code — only when set in wedding settings */}
        {wedding.dressCode && (
          <motion.div
            {...reveal(0.15)}
            className="mt-20 flex max-w-md flex-col items-center sm:mt-24"
          >
            <GoldDivider className="mb-10" />
            <p className={cn(smallCaps, "text-[#9b7b62]")}>Dress code</p>
            <p className={cn(displayFont, "mt-4 text-2xl font-light italic text-[#4a3236] sm:text-3xl")}>
              {wedding.dressCode}
            </p>
          </motion.div>
        )}

        <ChapterContinue href="#film" className="mt-20" revealProps={reveal(0.2, 12)}>
          Continue to the film
        </ChapterContinue>
      </div>
    </section>
  );
}
