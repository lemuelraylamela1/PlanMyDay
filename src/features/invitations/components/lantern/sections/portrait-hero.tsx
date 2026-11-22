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
 * random next frame every 2 seconds (no crossfade, no backdrop flash).
 */
export function PortraitHero() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { isMobile, isCompact, isShort } = useInviteViewport();
  const [baseIndex, setBaseIndex] = React.useState(0);
  const [pendingIndex, setPendingIndex] = React.useState<number | null>(null);
  const [pendingReady, setPendingReady] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [inView, setInView] = React.useState(false);
  const baseIndexRef = React.useRef(baseIndex);
  const pendingIndexRef = React.useRef(pendingIndex);

  React.useEffect(() => {
    baseIndexRef.current = baseIndex;
  }, [baseIndex]);

  React.useEffect(() => {
    pendingIndexRef.current = pendingIndex;
  }, [pendingIndex]);

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
      // Wait until the current swap finishes before queuing another.
      if (pendingIndexRef.current !== null) return;
      setPendingReady(false);
      setPendingIndex(
        pickRandomIndex(baseIndexRef.current, portraitHeroImages.length),
      );
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [inView, reduceMotion]);

  // Promote the preloaded frame with an instant hard cut (no fade).
  // Keep the overlay up for two frames so the base image can adopt the
  // new src underneath without exposing the section background.
  React.useEffect(() => {
    if (pendingIndex === null || !pendingReady) return;
    setBaseIndex(pendingIndex);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setPendingIndex(null);
        setPendingReady(false);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pendingIndex, pendingReady]);

  const dateLine = wedding.event.dateLong.toLowerCase().startsWith(
    wedding.event.dayOfWeek.toLowerCase(),
  )
    ? wedding.event.dateLong
    : `${wedding.event.dayOfWeek}, ${wedding.event.dateLong}`;

  const baseImage = portraitHeroImages[baseIndex] ?? portraitHeroImages[0]!;
  const pendingImage =
    pendingIndex !== null ? portraitHeroImages[pendingIndex] : null;

  return (
    <section
      ref={sectionRef}
      id="portrait"
      className="relative w-full max-w-[100vw] shrink-0 overflow-hidden bg-black"
      style={{
        // Fixed svh: a live px height re-laid out the page every time the
        // phone address bar moved, so everything below jumped mid-scroll.
        height: "100svh",
      }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={
            {
              "--mobile-position": baseImage.mobileObjectPosition,
              "--desktop-position": baseImage.objectPosition,
            } as React.CSSProperties
          }
        >
          <Image
            src={baseImage.src}
            alt={baseImage.alt}
            fill
            priority
            sizes="(max-width: 639px) 100vw, (max-width: 1280px) 100vw, 1440px"
            quality={isMobile ? 70 : 82}
            className="object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]"
          />
        </div>

        {pendingImage ? (
          <div
            className="absolute inset-0"
            style={
              {
                opacity: pendingReady ? 1 : 0,
                "--mobile-position": pendingImage.mobileObjectPosition,
                "--desktop-position": pendingImage.objectPosition,
              } as React.CSSProperties
            }
          >
            <Image
              src={pendingImage.src}
              alt={pendingImage.alt}
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1280px) 100vw, 1440px"
              quality={isMobile ? 70 : 82}
              className="object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]"
              onLoadingComplete={() => {
                requestAnimationFrame(() => setPendingReady(true));
              }}
            />
          </div>
        ) : null}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]"
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
