"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ExternalLink } from "lucide-react";

import { GoldButton } from "../ui/gold-button";
import { useLanternContent } from "../content-context";
import { VENUE_IMAGE } from "../media";

const LUXURY = [0.16, 1, 0.3, 1] as const;

/**
 * Cinematic Event Details — date, ceremony start, venue, and parking.
 */
export function EventDetails() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { ceremony, venue, dateLong, dayOfWeek } = wedding.event;
  const sectionRef = React.useRef<HTMLElement>(null);

  const mapsLink =
    venue.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery)}`;

  const dateLine = dateLong.toLowerCase().startsWith(dayOfWeek.toLowerCase())
    ? dateLong
    : `${dayOfWeek}, ${dateLong}`;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["0%", "22%"],
  );
  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [1.08, 1],
  );
  const veilOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.7, 1],
    [0.35, 0.55, 0.68, 0.78],
  );

  return (
    <section
      id="details"
      ref={sectionRef}
      className="relative h-[180vh] w-full max-w-[100vw] shrink-0 sm:h-[200vh]"
    >
      <div className="sticky top-0 h-[100vh] h-[100svh] h-[100dvh] overflow-hidden bg-night">
        <motion.div
          className="absolute inset-x-0 -top-[12%] h-[124%] w-full will-change-transform"
          style={{ y: imageY, scale: imageScale }}
        >
          <Image
            src={venue.imageSrc ?? VENUE_IMAGE.src}
            alt={venue.imageAlt ?? VENUE_IMAGE.alt}
            fill
            sizes="100vw"
            quality={85}
            className="object-cover object-[50%_42%]"
            priority={false}
          />
        </motion.div>

        <motion.div
          aria-hidden
          className="absolute inset-0 bg-night"
          style={{ opacity: veilOpacity }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/35 to-night/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(13,7,32,0.55)_100%)]"
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 overflow-y-auto px-4 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-10 sm:px-8 lg:px-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: LUXURY }}
            className="w-full max-w-3xl text-center"
          >
            <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.4em] text-lantern-soft/90">
              The Celebration
            </p>
            <h2 className="mt-2 font-display text-[2.1rem] font-light leading-[1.05] tracking-[-0.02em] text-cream sm:mt-3 sm:text-6xl lg:text-7xl">
              Event Details
            </h2>
            <div className="mx-auto mt-4 h-px w-20 bg-gradient-to-r from-transparent via-lantern/75 to-transparent sm:mt-5 sm:w-36" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.95, ease: LUXURY, delay: 0.08 }}
            className="flex w-full max-w-2xl flex-col items-center text-center"
          >
            <p className="font-serif text-lg italic text-cream/90 sm:text-2xl">
              {dateLine}
            </p>

            <p className="mt-5 font-cinzel text-[10px] font-semibold uppercase tracking-[0.32em] text-lantern/90 sm:mt-6">
              Ceremony begins
            </p>
            <p className="mt-2 font-display text-3xl font-light text-cream sm:text-5xl">
              {ceremony.time}
            </p>
            <p className="mt-1.5 font-serif text-sm italic text-cream/75 sm:text-base">
              {ceremony.timezoneNote}
            </p>

            <div className="mx-auto my-6 h-px w-16 bg-gradient-to-r from-transparent via-lantern/60 to-transparent sm:my-8 sm:w-24" />

            <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.35em] text-cream/70">
              The Venue
            </p>
            <h3 className="mt-2 font-display text-2xl font-light text-cream sm:text-4xl">
              {venue.name}
              {venue.city ? `, ${venue.city}` : ""}
            </h3>
            <p className="mt-2 font-serif text-sm italic text-cream/80 sm:text-base">
              {venue.address}
            </p>
            <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.22em] text-cream/70 sm:text-xs sm:tracking-[0.26em]">
              {venue.parkingNote ?? "Lots of parking spaces available on site"}
            </p>

            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex sm:mt-7"
            >
              <GoldButton variant="outline" size="sm" className="gap-2">
                Open in Google Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </GoldButton>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
