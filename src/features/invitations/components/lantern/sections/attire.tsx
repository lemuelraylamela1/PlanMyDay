"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import { MagicDust } from "../effects/magic-dust";
import { PrismCarousel } from "../effects/prism-carousel";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

const LUXURY = [0.16, 1, 0.3, 1] as const;
const INK = { r: 42, g: 21, b: 64 };
const GOLD = { r: 168, g: 120, b: 28 };

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "").trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value) || full.length !== 6) {
    return { r: 245, g: 192, b: 207 };
  }
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbString(r: number, g: number, b: number) {
  return `rgb(${r}, ${g}, ${b})`;
}

function mixToward(
  hex: string,
  target: { r: number; g: number; b: number },
  amount: number,
) {
  const { r, g, b } = hexToRgb(hex);
  const t = Math.min(1, Math.max(0, amount));
  const mix = (from: number, to: number) => Math.round(from + (to - from) * t);
  return rgbString(mix(r, target.r), mix(g, target.g), mix(b, target.b));
}

function mixTowardWhite(hex: string, amount: number) {
  return mixToward(hex, { r: 255, g: 255, b: 255 }, amount);
}

function rgbaFromHex(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function backgroundForSwatch(swatch: string) {
  const top = mixTowardWhite(swatch, 0.82);
  const mid = mixTowardWhite(swatch, 0.62);
  const bottom = mixTowardWhite(swatch, 0.74);
  return `linear-gradient(180deg, ${top} 0%, ${mid} 46%, ${bottom} 100%)`;
}

function paletteForSwatch(swatch: string) {
  return {
    title: mixToward(swatch, INK, 0.88),
    body: mixToward(swatch, INK, 0.78),
    accent: mixToward(swatch, INK, 0.55),
    gold: mixToward(swatch, GOLD, 0.72),
    rule: mixToward(swatch, INK, 0.42),
  };
}

function HexSwatch({
  hex,
  label,
}: {
  hex: string;
  label: string;
}) {
  const [open, setOpen] = React.useState(false);
  const value = hex.toUpperCase();

  return (
    <button
      type="button"
      role="listitem"
      title={value}
      aria-label={`${label}: ${value}`}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      onBlur={() => setOpen(false)}
      className="group relative h-8 w-8 shrink-0 rounded-full outline-none transition-transform duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-[#2a1540]/30 focus-visible:ring-offset-2 sm:h-9 sm:w-9"
      style={{
        background: hex,
        border: `1px solid ${rgbaFromHex(hex, 0.45)}`,
      }}
    >
      <span
        className={[
          "pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2a1540] px-2 py-1 font-cinzel text-[9px] font-semibold uppercase tracking-[0.14em] text-[#fdf6ec] shadow-sm transition-opacity duration-150",
          open
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
        ].join(" ")}
      >
        {value}
      </span>
    </button>
  );
}

function AttireLightbox({
  src,
  alt,
  title,
  onClose,
}: {
  src: string;
  alt: string;
  title?: string;
  onClose: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex touch-none items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} attire reference` : "Attire reference"}
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[#120814]/78 backdrop-blur-2xl"
        onClick={onClose}
      />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close fullscreen image"
        className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-[#2a1540] shadow-sm transition hover:bg-cream sm:right-5 sm:top-5"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative z-10 flex max-h-[min(92vh,920px)] w-full max-w-4xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[min(84vh,860px)] w-full overflow-hidden rounded-2xl">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 896px) 94vw, 896px"
            className="object-contain"
            priority
          />
        </div>
        {title ? (
          <p className="mt-4 font-display text-xl font-light tracking-[-0.02em] text-[#fdf6ec] sm:text-2xl">
            {title}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Visual RSVP attire guide with Prism-inspired lookbook coverflow.
 */
export function Attire() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { dressCode } = wedding.event;
  const roles = dressCode.roles;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const carouselItems = React.useMemo(
    () =>
      roles.map((role) => ({
        src: role.imageSrc,
        alt: role.imageAlt,
        title: role.role,
        subtitle: role.description,
      })),
    [roles],
  );

  const activeRole = roles[activeIndex] ?? roles[0];
  const activeSwatches = activeRole?.swatches ?? [];
  const activeSwatch = activeSwatches[0] ?? "#f5c0cf";
  const colors = paletteForSwatch(activeSwatch);
  const lightboxRole =
    lightboxIndex !== null ? roles[lightboxIndex] ?? null : null;

  React.useEffect(() => {
    if (activeIndex >= roles.length) setActiveIndex(0);
  }, [activeIndex, roles.length]);

  if (!activeRole) return null;

  return (
    <motion.section
      id="attire"
      className="relative overflow-hidden lantern-section"
      initial={false}
      animate={{ background: backgroundForSwatch(activeSwatch) }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.85, ease: LUXURY }
      }
      style={{ color: colors.body }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: 0.42 }}
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 22% 12%, ${rgbaFromHex(activeSwatch, 0.42)}, transparent 48%),
            radial-gradient(ellipse at 78% 18%, ${rgbaFromHex(activeSwatch, 0.28)}, transparent 44%),
            radial-gradient(ellipse at 50% 92%, ${rgbaFromHex(activeSwatch, 0.22)}, transparent 52%)
          `,
        }}
        key={activeSwatch}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.85, ease: LUXURY }
        }
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
          <p
            className="font-cinzel text-[12px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: colors.accent }}
          >
            {dressCode.eyebrow}
          </p>

          <div className="mt-4 flex items-center gap-4 sm:mt-5 sm:gap-5">
            <span
              aria-hidden
              className="h-px w-8 sm:w-12"
              style={{
                background: `linear-gradient(to right, transparent, ${colors.gold})`,
              }}
            />
            <h2
              className="font-display text-[2.15rem] font-light leading-[1.08] tracking-[-0.02em] min-[380px]:text-[2.5rem] sm:text-5xl lg:text-6xl"
              style={{ color: colors.title }}
            >
              {dressCode.title}
            </h2>
            <span
              aria-hidden
              className="h-px w-8 sm:w-12"
              style={{
                background: `linear-gradient(to left, transparent, ${colors.gold})`,
              }}
            />
          </div>

          <div
            className="mx-auto mt-5 h-px w-16 sm:mt-6 sm:w-24"
            style={{
              background: `linear-gradient(to right, transparent, ${colors.rule}, transparent)`,
            }}
          />

          <p
            className="mt-5 max-w-xl font-serif text-base italic leading-relaxed sm:mt-6 sm:text-xl sm:leading-[1.7]"
            style={{ color: colors.body }}
          >
            {dressCode.note}
          </p>

          <div className="mt-7 flex items-center gap-4 sm:mt-8 sm:gap-5">
            <span
              aria-hidden
              className="hidden h-px w-12 sm:block sm:w-16"
              style={{ background: colors.rule }}
            />
            <p
              className="font-cinzel text-base font-bold uppercase tracking-[0.22em] sm:text-xl sm:tracking-[0.28em] lg:text-2xl lg:tracking-[0.3em]"
              style={{ color: colors.title }}
            >
              {dressCode.restriction}
            </p>
            <span
              aria-hidden
              className="hidden h-px w-12 sm:block sm:w-16"
              style={{ background: colors.rule }}
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
            paused={!!reduceMotion || lightboxIndex !== null}
            sweep={reduceMotion ? 0 : 1}
            backgroundColor="transparent"
            titleColor={colors.title}
            subtitleColor={colors.body}
            accentColor={colors.accent}
            onIndexChange={setActiveIndex}
            onSelect={(_item, index) => setLightboxIndex(index)}
            className="mx-auto max-w-5xl"
          />
        </motion.div>

        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-10"
          role="list"
          aria-label={`${activeRole.role} color palette`}
        >
          {activeSwatches.map((hex) => (
            <HexSwatch
              key={`${activeRole.role}-${hex}`}
              hex={hex}
              label={activeRole.role}
            />
          ))}
        </div>
      </div>

      {lightboxRole ? (
        <AttireLightbox
          src={lightboxRole.imageSrc}
          alt={lightboxRole.imageAlt}
          title={lightboxRole.role}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </motion.section>
  );
}
