"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

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

/**
 * Visual RSVP attire guide with Prism-inspired lookbook coverflow.
 */
export function Attire() {
  const wedding = useLanternContent();
  const reduceMotion = useReducedMotion();
  const { dressCode } = wedding.event;
  const roles = dressCode.roles;
  const [activeIndex, setActiveIndex] = React.useState(0);

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

  const activeRole = roles[activeIndex] ?? roles[0];
  const activeSwatch = activeRole?.swatch ?? "#f5c0cf";
  const colors = paletteForSwatch(activeSwatch);

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
            className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.42em]"
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
              style={{ color: colors.gold }}
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
            paused={!!reduceMotion}
            sweep={reduceMotion ? 0 : 1}
            backgroundColor="transparent"
            titleColor={colors.title}
            subtitleColor={colors.body}
            accentColor={colors.accent}
            onIndexChange={setActiveIndex}
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
                border: `1px solid ${rgbaFromHex(item.swatch, 0.45)}`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
