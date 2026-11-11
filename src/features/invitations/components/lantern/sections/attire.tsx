"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { MagicDust } from "../effects/magic-dust";
import { PrismCarousel } from "../effects/prism-carousel";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

const LUXURY = [0.16, 1, 0.3, 1] as const;

/**
 * Visual RSVP attire guide with Prism-inspired lookbook coverflow.
 */
export function Attire() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { dressCode } = wedding.event;
  const roles = dressCode.roles;

  const carouselItems = React.useMemo(
    () =>
      roles.map((role) => ({
        src: role.imageSrc,
        alt: role.imageAlt,
        title: role.role,
        subtitle: role.attire,
      })),
    [roles],
  );

  if (roles.length === 0) return null;

  return (
    <section
      id="attire"
      className="relative overflow-hidden lantern-section"
      style={{
        background:
          "linear-gradient(180deg, #fff8f4 0%, #f7ebe7 42%, #fff6f8 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 10%, rgba(245,192,207,0.35), transparent 45%), radial-gradient(ellipse at 80% 20%, rgba(197,179,216,0.28), transparent 42%), radial-gradient(ellipse at 50% 90%, rgba(232,130,154,0.16), transparent 50%)",
        }}
      />
      <MagicDust count={12} intensity="soft" className="opacity-35" />
      <SceneAtmosphere tone="lantern-rose" className="opacity-35" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: LUXURY }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.42em] text-lantern-rose">
            {dressCode.eyebrow}
          </p>

          <div className="mt-4 flex items-center gap-4 sm:mt-5 sm:gap-5">
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-r from-transparent to-lantern/70 sm:w-12"
            />
            <h2 className="font-display text-[2.15rem] font-light leading-[1.08] tracking-[-0.02em] text-ink min-[380px]:text-[2.5rem] sm:text-5xl lg:text-6xl">
              {dressCode.title}
            </h2>
            <span
              aria-hidden
              className="h-px w-8 bg-gradient-to-l from-transparent to-lantern/70 sm:w-12"
            />
          </div>

          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-lantern-rose/70 to-transparent sm:mt-6 sm:w-24" />

          <p className="mt-5 max-w-xl font-serif text-base italic leading-relaxed text-ink/75 sm:mt-6 sm:text-xl sm:leading-[1.7]">
            {dressCode.note}
          </p>

          <div className="mt-7 flex items-center gap-4 sm:mt-8 sm:gap-5">
            <span
              aria-hidden
              className="hidden h-px w-12 bg-lantern-rose/50 sm:block sm:w-16"
            />
            <p className="font-cinzel text-base font-bold uppercase tracking-[0.22em] text-lantern sm:text-xl sm:tracking-[0.28em] lg:text-2xl lg:tracking-[0.3em]">
              {dressCode.restriction}
            </p>
            <span
              aria-hidden
              className="hidden h-px w-12 bg-lantern-rose/50 sm:block sm:w-16"
            />
          </div>
        </motion.header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: LUXURY, delay: 0.08 }}
          className="relative mt-10 sm:mt-12"
        >
          <PrismCarousel
            items={carouselItems}
            startIndex={0}
            autoplay={!reduceMotion}
            interval={4.8}
            loop
            captions
            controls
            draggable
            wheel={false}
            pauseOnHover
            paused={!!reduceMotion}
            sweep={reduceMotion ? 0 : 1}
            backgroundColor="transparent"
            className="mx-auto max-w-5xl"
          />
        </motion.div>

        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-10"
          role="list"
          aria-label="Wedding motif color palette"
        >
          {roles.map((item) => (
            <span
              key={`palette-${item.role}`}
              role="listitem"
              title={item.role}
              aria-label={`${item.role}: ${item.attire}`}
              className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
              style={{
                background: item.swatch,
                border: "1px solid rgba(232,130,154,0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
