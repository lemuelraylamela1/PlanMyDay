"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";

import { GoldButton } from "../ui/gold-button";
import { useLanternContent } from "../content-context";
import { VENUE_IMAGE } from "../media";
import { StarField } from "../effects/star-field";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";

const LUXURY = [0.16, 1, 0.3, 1] as const;

/**
 * Event Details — date, ceremony, and a clear venue photo (not a full-bleed bg).
 */
export function EventDetails() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { ceremony, venue, dateLong, dayOfWeek } = wedding.event;

  const mapsLink =
    venue.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery)}`;

  const dateLine = dateLong.toLowerCase().startsWith(dayOfWeek.toLowerCase())
    ? dateLong
    : `${dayOfWeek}, ${dateLong}`;

  const venueSrc = venue.imageSrc ?? VENUE_IMAGE.src;
  const venueAlt = venue.imageAlt ?? VENUE_IMAGE.alt;

  return (
    <section
      id="details"
      className="relative w-full max-w-[100vw] shrink-0 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0d0720 0%, #1e0f3a 55%, #2d1b5e 100%)",
      }}
    >
      <StarField className="absolute inset-0" count={140} parallaxFactor={0} />
      <MagicDust count={12} intensity="soft" className="opacity-50 max-sm:opacity-35" />
      <SceneAtmosphere tone="night" className="opacity-65" />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="lantern-glow absolute left-1/2 top-[18%] h-[42vh] w-[42vh] -translate-x-1/2 opacity-40" />
        <div className="aurora-glow absolute bottom-0 left-1/2 h-[36vh] w-[90vw] -translate-x-1/2 opacity-45" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.9, ease: LUXURY }}
          className="w-full text-center"
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
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.95, ease: LUXURY, delay: 0.06 }}
          className="mt-10 flex w-full flex-col items-center text-center sm:mt-12"
        >
          <p className="font-serif text-lg italic text-cream/90 sm:text-2xl">{dateLine}</p>

          <p className="mt-6 font-cinzel text-[10px] font-semibold uppercase tracking-[0.32em] text-lantern/90">
            Ceremony begins
          </p>
          <p className="mt-2 font-display text-3xl font-light text-cream sm:text-5xl">
            {ceremony.time}
          </p>
          <p className="mt-1.5 font-serif text-sm italic text-cream/75 sm:text-base">
            {ceremony.timezoneNote}
          </p>

          <div className="mx-auto my-8 h-px w-16 bg-gradient-to-r from-transparent via-lantern/60 to-transparent sm:my-10 sm:w-24" />

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
        </motion.div>

        <motion.figure
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 1, ease: LUXURY, delay: 0.1 }}
          className="relative mt-8 w-full sm:mt-10"
        >
          <div className="relative overflow-hidden border border-lantern/35 bg-night/40 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.85)]">
            <div className="relative aspect-[16/11] w-full sm:aspect-[16/10]">
              <Image
                src={venueSrc}
                alt={venueAlt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                quality={82}
                className="object-cover object-center"
                priority={false}
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-lantern/20"
            />
          </div>
          <figcaption className="mt-3 text-center font-cinzel text-[9px] font-semibold uppercase tracking-[0.28em] text-cream/55 sm:text-[10px]">
            A glimpse of Fernwood Gardens
          </figcaption>
        </motion.figure>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: LUXURY, delay: 0.12 }}
          className="mt-7 flex w-full flex-col items-center text-center sm:mt-8"
        >
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-cream/70 sm:text-xs sm:tracking-[0.26em]">
            {venue.parkingNote ?? "Lots of parking spaces available on site"}
          </p>

          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex"
          >
            <GoldButton variant="outline" size="sm" className="gap-2">
              Open in Google Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </GoldButton>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
