"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion, type MotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  fairytaleEase,
  fairytaleMotion,
  fairytaleTransition,
} from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useDepthLayer,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import {
  displayFont,
  heroDisplay,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";
import {
  fairytale,
  fairytaleAtmosphere,
} from "@/features/invitations/components/fairytale/fairytale-tokens";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
import { SceneTransition } from "@/features/invitations/components/fairytale/scene-transition";
import type { InvitationWedding } from "@/features/invitations/components/fairytale/types";

interface Props {
  wedding: InvitationWedding;
  /** Holds the hero entrance until the invitation transition reveals the page. */
  entered?: boolean;
}

export function HeroChapter({ wedding, entered = true }: Props) {
  const ref = React.useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { amount: 0.45 });
  const [activeImage, setActiveImage] = React.useState(0);
  const progress = useChapterScroll(ref);
  const { y: imageY } = useDepthLayer(progress, "far");
  const heroImages = fairytaleMedia.hero;

  const reveal = (delay = 0): MotionProps => {
    if (reduceMotion) return {};
    const hidden = { opacity: 0, y: fairytaleMotion.rise + 6 };
    return {
      initial: hidden,
      animate: entered ? { opacity: 1, y: 0 } : hidden,
      transition: fairytaleTransition(fairytaleMotion.reveal + 0.15, delay),
    };
  };

  React.useEffect(() => {
    if (reduceMotion || !entered || !inView || heroImages.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [entered, heroImages.length, inView, reduceMotion]);

  return (
    <section id="portrait" ref={ref} data-scene="hero" className="relative">
      <motion.div
        className="relative h-[100svh] min-h-[28rem] overflow-hidden"
        style={{ backgroundColor: fairytale.midnight }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={fairytaleTransition(fairytaleMotion.panel + 0.15)}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { scale: 1.05 }}
          animate={{ scale: entered ? 1 : 1.05 }}
          transition={fairytaleTransition(fairytaleMotion.atmosphere)}
        >
          <div data-scene-camera className="absolute inset-0 will-change-transform">
            <motion.div
              className="absolute inset-x-0 bottom-[-8%] top-[-8%]"
              style={reduceMotion ? undefined : { y: imageY }}
            >
              {heroImages.length > 0 ? (
                heroImages.map((image, index) => (
                  <motion.div
                    key={image.src ?? `hero-${index}`}
                    aria-hidden={index !== activeImage}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: index === activeImage ? 1 : 0 }}
                    transition={{ opacity: fairytaleTransition(fairytaleMotion.crossfade) }}
                    style={
                      {
                        "--mobile-position": image.mobileObjectPosition,
                        "--desktop-position": image.objectPosition,
                      } as React.CSSProperties
                    }
                  >
                    {image.src && (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        quality={82}
                        className="object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]"
                      />
                    )}
                  </motion.div>
                ))
              ) : (
                <HeroPlaceholder monogram={wedding.monogram} />
              )}
            </motion.div>
          </div>
        </motion.div>
        <SceneTransition tone="hero" className="z-[1]" />
        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,214,150,0.22), rgba(88,62,128,0.45) 55%, rgba(29,26,51,0.75))",
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: entered ? 0 : 1 }}
            transition={{ duration: 2.4, ease: fairytaleEase }}
          />
        )}

        <div
          aria-hidden
          className="absolute inset-0 sm:hidden"
          style={{ backgroundImage: fairytaleAtmosphere.heroVignette }}
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden sm:block"
          style={{ backgroundImage: fairytaleAtmosphere.heroVignetteDesktop }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 40% 30% at 70% 30%, rgba(232,212,168,0.14), transparent 65%)",
          }}
        />

        <div
          data-scene-content
          className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-2xl flex-col items-center p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[#FFFDF8] sm:mx-0 sm:items-start sm:p-12 sm:text-left"
        >
          {wedding.dateLabel && (
            <motion.p {...reveal(0.15)} className={cn(smallCaps, "text-[#E8D4A8]")}>
              {wedding.dateLabel}
            </motion.p>
          )}
          <motion.h1
            {...reveal(0.28)}
            className={cn(
              displayFont,
              heroDisplay,
              "mt-3 max-w-[20rem] text-balance sm:mt-4 sm:max-w-none",
            )}
          >
            {wedding.coupleNames}
          </motion.h1>
          {wedding.venueName && (
            <motion.p
              {...reveal(0.4)}
              className={cn(
                displayFont,
                "mt-5 max-w-sm text-base italic leading-relaxed text-[#FFFDF8]/88 sm:text-lg",
              )}
            >
              {heroVenueLine(wedding.venueName, wedding.venueAddress)}
            </motion.p>
          )}
          <ChapterContinue
            href="#invitation"
            tone="hero"
            align="center"
            className="mt-8 sm:!items-start"
            revealProps={reveal(0.55)}
          >
            Continue to the invitation
          </ChapterContinue>
        </div>

        {heroImages.length > 1 && (
          <div
            className="absolute right-4 top-[max(1.25rem,env(safe-area-inset-top))] flex gap-1 sm:right-8 sm:top-8"
            role="tablist"
            aria-label="Wedding portraits"
          >
            {heroImages.map((image, index) => (
              <button
                key={image.src ?? index}
                type="button"
                role="tab"
                aria-selected={activeImage === index}
                aria-label={`Show portrait ${index + 1}`}
                onClick={() => setActiveImage(index)}
                className="relative flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]"
              >
                <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-white/35" />
                <motion.span
                  className="absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-1/2 bg-[#FFFDF8]"
                  initial={false}
                  animate={{ width: activeImage === index ? 20 : 0 }}
                  transition={fairytaleTransition(fairytaleMotion.ui + 0.15)}
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

/** Short hero venue line — full address lives in the invitation chapter. */
function heroVenueLine(venueName: string, venueAddress: string | null) {
  if (!venueAddress?.trim()) return venueName;
  const parts = venueAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  const titled = (city ?? "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return titled ? `${venueName} · ${titled}` : venueName;
}

function HeroPlaceholder({ monogram }: { monogram: string }) {
  return (
    <div
      className="absolute inset-0 flex items-start justify-center pt-[16%] sm:items-center sm:pt-0"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 50% 42% at 50% 42%, rgba(232,212,168,0.18), transparent 72%), linear-gradient(180deg,#2a2c45,#22243A)",
      }}
    >
      <div className="relative flex h-[46%] min-h-[15rem] w-[min(64vw,20rem)] flex-col items-center justify-center rounded-t-full border border-[#DDBF8D]/40">
        <span aria-hidden className="absolute inset-3 rounded-t-full border border-[#DDBF8D]/20" />
        <span className={cn(displayFont, "text-6xl font-light text-[#DDBF8D]/80")}>{monogram}</span>
        <span className={cn(smallCaps, "mt-5 text-[#DDBF8D]/60")}>Portrait forthcoming</span>
      </div>
    </div>
  );
}
