"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { portraitHeroImages } from "../media";
import { useLanternContent } from "../content-context";
import { useIsMobile } from "../hooks/use-is-mobile";

const ROTATE_MS = 3000;
const LUXURY = [0.16, 1, 0.3, 1] as const;

/**
 * Second hero: exact viewport height, proposal photos crossfade every 3 seconds.
 */
export function PortraitHero() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [active, setActive] = React.useState(0);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (reduceMotion || !inView || portraitHeroImages.length < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % portraitHeroImages.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [inView, reduceMotion]);

  const dateLine = wedding.event.dateLong.toLowerCase().startsWith(
    wedding.event.dayOfWeek.toLowerCase(),
  )
    ? wedding.event.dateLong
    : `${wedding.event.dayOfWeek}, ${wedding.event.dateLong}`;

  return (
    <section
      ref={sectionRef}
      id="portrait"
      className="relative h-[100vh] h-[100svh] h-[100dvh] w-full max-w-[100vw] shrink-0 overflow-hidden bg-night"
    >
      <div className="absolute inset-0">
        {portraitHeroImages.map((image, index) => {
          const visible = reduceMotion ? index === 0 : index === active;
          return (
            <motion.div
              key={image.src}
              aria-hidden={!visible}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 1.1, ease: LUXURY }}
              style={
                {
                  "--mobile-position": image.mobileObjectPosition,
                  "--desktop-position": image.objectPosition,
                } as React.CSSProperties
              }
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 639px) 100vw, (max-width: 1280px) 100vw, 1440px"
                quality={isMobile ? 72 : 82}
                className="object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]"
              />
            </motion.div>
          );
        })}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(13,7,32,0.45)_100%)]"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] text-center sm:px-6 sm:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY }}
          className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.36em] text-lantern-soft/90 sm:text-[10px] sm:tracking-[0.45em]"
        >
          Save the Date
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: LUXURY, delay: 0.08 }}
          className="mt-4 font-display text-[2.35rem] font-light leading-[1.05] tracking-[-0.02em] text-cream drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)] min-[380px]:text-[2.75rem] sm:mt-5 sm:text-6xl lg:text-7xl"
        >
          {wedding.event.venue.name}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.15 }}
          className="mx-auto my-5 h-px w-24 bg-gradient-to-r from-transparent via-lantern/80 to-transparent sm:my-6 sm:w-36"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.18 }}
          className="font-serif text-lg italic text-cream/90 sm:text-2xl"
        >
          {dateLine}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.22 }}
          className="mt-4 font-serif text-base text-cream/90 sm:mt-5 sm:text-lg"
        >
          {wedding.event.ceremony.time}
          {wedding.event.ceremony.timezoneNote
            ? ` · ${wedding.event.ceremony.timezoneNote}`
            : ""}
        </motion.p>

        <div className="mt-8 flex items-center gap-2" aria-hidden>
          {portraitHeroImages.map((image, index) => (
            <span
              key={image.src}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === active ? "w-6 bg-lantern" : "w-1.5 bg-cream/40",
              )}
            />
          ))}
        </div>
      </div>

      <a
        href="#quote"
        aria-label="Scroll down to continue"
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-cream/80"
      >
        <span className="whitespace-nowrap font-cinzel text-[8px] font-semibold uppercase tracking-[0.18em] text-cream/70 min-[380px]:text-[9px] min-[380px]:tracking-[0.24em] sm:text-[10px] sm:tracking-[0.32em]">
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
