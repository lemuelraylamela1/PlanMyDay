"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { portraitHeroImages } from "../media";
import { useLanternContent } from "../content-context";
import { useInviteViewport } from "../hooks/use-is-mobile";

const ROTATE_MS = 2000;
const LUXURY = [0.16, 1, 0.3, 1] as const;

function pickRandomIndex(exclude: number, length: number) {
  if (length <= 1) return 0;
  let next = exclude;
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

/**
 * Second hero: exact viewport height; gallery photos hard-cut to a
 * random next frame every 2 seconds (no crossfade).
 */
export function PortraitHero() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { isMobile, isCompact, isShort, height } = useInviteViewport();
  const [active, setActive] = React.useState(0);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (reduceMotion || !inView || portraitHeroImages.length < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => pickRandomIndex(current, portraitHeroImages.length));
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [inView, reduceMotion]);

  const dateLine = wedding.event.dateLong.toLowerCase().startsWith(
    wedding.event.dayOfWeek.toLowerCase(),
  )
    ? wedding.event.dateLong
    : `${wedding.event.dayOfWeek}, ${wedding.event.dateLong}`;

  const image = portraitHeroImages[active] ?? portraitHeroImages[0]!;

  return (
    <section
      ref={sectionRef}
      id="portrait"
      className="relative w-full max-w-[100vw] shrink-0 overflow-hidden bg-night"
      style={{
        height: height
          ? `${height}px`
          : "100dvh",
        minHeight: "100svh",
      }}
    >
      <div
        className="absolute inset-0"
        style={
          {
            "--mobile-position": image.mobileObjectPosition,
            "--desktop-position": image.objectPosition,
          } as React.CSSProperties
        }
      >
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={active === 0}
          sizes="(max-width: 639px) 100vw, (max-width: 1280px) 100vw, 1440px"
          quality={isMobile ? 70 : 82}
          className="object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(13,7,32,0.5)_100%)]"
      />

      <div
        className={
          isCompact
            ? "absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-3 pb-[max(4.75rem,calc(env(safe-area-inset-bottom)+3.75rem))] text-center"
            : isShort
              ? "absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))] text-center"
              : "absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] text-center sm:px-6 sm:pb-28"
        }
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY }}
          className="font-cinzel text-[12px] font-semibold uppercase tracking-[0.28em] text-lantern-soft sm:tracking-[0.38em]"
        >
          Save the Date
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: LUXURY, delay: 0.08 }}
          className={
            isCompact
              ? "mt-3 font-display text-[1.95rem] font-light leading-[1.05] tracking-[-0.02em] text-cream drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
              : "mt-4 font-display text-[2.35rem] font-light leading-[1.05] tracking-[-0.02em] text-cream drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)] min-[380px]:text-[2.75rem] sm:mt-5 sm:text-6xl lg:text-7xl"
          }
        >
          {wedding.event.venue.name}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.15 }}
          className="mx-auto my-4 h-px w-24 bg-gradient-to-r from-transparent via-lantern/80 to-transparent sm:my-6 sm:w-36"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.18 }}
          className="font-serif text-lg italic text-cream sm:text-2xl"
        >
          {dateLine}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.22 }}
          className="mt-3 font-serif text-lg text-cream sm:mt-5 sm:text-xl"
        >
          {wedding.event.ceremony.time}
          {wedding.event.ceremony.timezoneNote
            ? ` · ${wedding.event.ceremony.timezoneNote}`
            : ""}
        </motion.p>
      </div>

      <a
        href="#quote"
        aria-label="Scroll down to continue"
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-cream"
      >
        <span className="whitespace-nowrap font-cinzel text-[11px] font-semibold uppercase tracking-[0.2em] text-cream min-[380px]:text-[12px] min-[380px]:tracking-[0.24em] sm:tracking-[0.3em]">
          Scroll down to continue
        </span>
        <motion.span
          animate={isMobile || reduceMotion ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ChevronDown className="h-7 w-7" />
        </motion.span>
      </a>
    </section>
  );
}
