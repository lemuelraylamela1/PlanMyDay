"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useParallaxY,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import { displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";
import type { InvitationWedding } from "@/features/invitations/components/fairytale/types";

export function HeroChapter({ wedding }: { wedding: InvitationWedding }) {
  const ref = React.useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { amount: 0.2 });
  const reveal = useReveal();
  const [activeImage, setActiveImage] = React.useState(0);
  const progress = useChapterScroll(ref);
  const imageY = useParallaxY(progress, "-4%", "6%");
  const heroImages = fairytaleMedia.hero;

  React.useEffect(() => {
    if (reduceMotion || !inView || heroImages.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [heroImages.length, inView, reduceMotion]);

  return (
    <section id="portrait" ref={ref} className="relative">
      <motion.div
        className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-[#241c20]"
        initial={reduceMotion ? false : { opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: fairytaleEase }}
      >
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
                transition={{ opacity: { duration: 1.8, ease: fairytaleEase } }}
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
                    quality={70}
                    className="object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]"
                  />
                )}
              </motion.div>
            ))
          ) : (
            <HeroPlaceholder monogram={wedding.monogram} />
          )}
        </motion.div>

        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,17,0.08)_25%,rgba(18,14,17,0.28)_58%,rgba(18,14,17,0.92)_100%)] sm:bg-[linear-gradient(90deg,rgba(18,14,17,0.64)_0%,rgba(18,14,17,0.12)_52%,transparent_78%),linear-gradient(0deg,rgba(18,14,17,0.72),transparent_50%)]"
        />

        <div className="absolute inset-x-0 bottom-0 max-w-xl p-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#FFFDF8] sm:p-12">
          {wedding.dateLabel && (
            <motion.p {...reveal(0.3)} className={cn(smallCaps, "text-[#DDBF8D]")}>
              {wedding.dateLabel}
            </motion.p>
          )}
          <motion.p
            {...reveal(0.5)}
            className={cn(
              displayFont,
              "mt-3 max-w-[19rem] text-balance text-[2.6rem] font-light leading-[0.98] sm:max-w-none sm:text-6xl",
            )}
          >
            {wedding.coupleNames}
          </motion.p>
          <motion.p
            {...reveal(0.65)}
            className="mt-4 max-w-xs text-sm leading-relaxed text-[#FFFDF8]/78"
          >
            A chapter written in wonder, and a promise made for always.
          </motion.p>
          <motion.a
            {...reveal(0.8)}
            href="#invitation"
            className={cn(
              smallCaps,
              "mt-7 inline-flex flex-col items-start gap-3 text-[#FFFDF8]/75 transition-colors hover:text-[#DDBF8D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]",
            )}
          >
            Continue to the invitation
            <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-[#FFFDF8]/35">
              <motion.span
                className="absolute inset-x-0 top-0 block h-1/2 bg-[#DDBF8D]"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: fairytaleEase }}
              />
            </span>
          </motion.a>
        </div>

        {heroImages.length > 1 && (
          <div
            className="absolute right-5 top-[max(1.5rem,env(safe-area-inset-top))] flex gap-2 sm:right-9 sm:top-9"
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
                className="relative h-8 w-8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]"
              >
                <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-white/35" />
                <motion.span
                  className="absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-1/2 bg-[#FFFDF8]"
                  initial={false}
                  animate={{ width: activeImage === index ? 20 : 0 }}
                  transition={{ duration: 0.65, ease: fairytaleEase }}
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function HeroPlaceholder({ monogram }: { monogram: string }) {
  return (
    <div
      className="absolute inset-0 flex items-start justify-center pt-[16%] sm:items-center sm:pt-0"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 50% 42% at 50% 42%, rgba(221,191,141,0.2), transparent 72%), linear-gradient(180deg,#2c2328,#1c1619)",
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
