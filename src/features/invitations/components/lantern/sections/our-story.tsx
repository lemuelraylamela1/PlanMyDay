"use client";

import * as React from "react";
import Image from "next/image";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";
import { useExperience } from "../experience/experience-provider";
import { useLanternPerf } from "../performance/lantern-perf-provider";
import { scaleEffectCount } from "../performance/profiles";
import { useStoryWandPath } from "../hooks/use-story-wand-path";
import { cn } from "@/lib/utils";

function MagicWand() {
  return (
    <div className="story-wand" aria-hidden>
      <svg
        viewBox="0 0 64 160"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="storyWandHandle" x1="32" y1="40" x2="32" y2="156" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f4c444" />
            <stop offset="0.45" stopColor="#c9892e" />
            <stop offset="1" stopColor="#6b3e18" />
          </linearGradient>
          <radialGradient id="storyWandTipGlow" cx="50%" cy="50%" r="50%">
            <stop stopColor="#fff6d6" stopOpacity="1" />
            <stop offset="0.4" stopColor="#ffdf70" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f4c444" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="story-wand-aura" cx="32" cy="28" rx="22" ry="22" fill="url(#storyWandTipGlow)" />
        <path
          d="M30.2 42 L33.8 42 L36.2 152 C36.2 155 34.4 157 32 157 C29.6 157 27.8 155 27.8 152 Z"
          fill="url(#storyWandHandle)"
        />
        <path
          d="M28.5 48 H35.5"
          stroke="#ffdf70"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <g className="story-wand-tip" transform="translate(32 28)">
          <path
            d="M0 -14 L3.2 -3.2 L14 0 L3.2 3.2 L0 14 L-3.2 3.2 L-14 0 L-3.2 -3.2 Z"
            fill="#fff8e7"
            stroke="#f4c444"
            strokeWidth="1.2"
          />
          <circle cx="0" cy="0" r="3.2" fill="#ffdf70" />
        </g>
      </svg>
    </div>
  );
}

export function OurStory() {
  const wedding = useLanternContent();
  const { reducedMotion } = useExperience();
  const { profile, compact, quality } = useLanternPerf();
  const pathRef = React.useRef<HTMLDivElement>(null);

  const chapters = wedding.story.chapters;
  const enablePath = !reducedMotion && quality !== "low";
  const starTrail = enablePath;
  const maxStars = scaleEffectCount(18, profile.starScale, compact, 4);

  useStoryWandPath(pathRef, {
    enabled: enablePath,
    starTrail,
    maxStars,
  });

  return (
    <section
      id="story"
      className="relative overflow-hidden lantern-section"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-56 w-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,7,32,0.18) 0%, rgba(244,196,68,0.08) 45%, transparent 100%)",
        }}
      />
      <MagicDust count={20} intensity="soft" className="opacity-50" />
      <SceneAtmosphere tone="warm" className="opacity-60" />

      {/* Prologue — editorial opener, not a generic section heading stack */}
      <header className="story-prologue relative z-[1] mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6">
        <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.45em] text-[#b76e79]">
          {wedding.story.eyebrow}
        </p>
        <h2 className="story-prologue-title mt-5 max-w-[14ch] font-display text-[2.35rem] font-light leading-[1.08] tracking-[-0.03em] text-ink min-[380px]:text-4xl sm:max-w-none sm:text-6xl md:text-[4.25rem]">
          {wedding.story.title}
        </h2>
        <p className="mt-6 max-w-xl font-serif text-lg leading-[1.85] text-ink/75 sm:text-xl sm:leading-[1.9]">
          {wedding.story.intro}
        </p>
      </header>

      <div ref={pathRef} className="story-path relative z-[1] mt-12 w-full sm:mt-16">
        <div className="story-star-trail pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden />

        <div
          className="story-path-start absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-2"
          aria-hidden
        >
          <MagicWand />
          <span className="sr-only">Story path begins</span>
        </div>

        <div className="flex flex-col gap-16 sm:gap-24 md:gap-28">
          {chapters.map((c, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <article
                key={`${c.chapter}-${c.title}`}
                className={cn(
                  "story-chapter relative",
                  !enablePath && "is-lit",
                  imageLeft ? "story-chapter--image-left" : "story-chapter--image-right",
                )}
              >
                <span className="story-chapter-marker" aria-hidden />

                <div
                  className={cn(
                    "mx-auto grid max-w-6xl items-center gap-8 px-0 sm:gap-10 sm:px-6 lg:gap-14",
                    "grid-cols-1 lg:grid-cols-2",
                  )}
                >
                  <div
                    className={cn(
                      "story-chapter-media relative w-full overflow-hidden",
                      imageLeft ? "lg:order-1" : "lg:order-2",
                    )}
                  >
                    <div className="story-chapter-frame relative aspect-[4/5] w-full sm:aspect-[3/4] lg:aspect-[4/5]">
                      <Image
                        src={c.imageSrc}
                        alt={c.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="story-chapter-image object-cover"
                        priority={i === 0}
                      />
                      <div className="story-chapter-vignette" aria-hidden />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "story-chapter-prose px-4 sm:px-0",
                      imageLeft
                        ? "lg:order-2 lg:pl-2 lg:pr-6"
                        : "lg:order-1 lg:pl-6 lg:pr-2",
                    )}
                  >
                    <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.4em] text-lantern-rose/80">
                      {c.chapter}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-ink sm:text-4xl md:text-[2.75rem]">
                      {c.title}
                    </h3>
                    <p className="mt-2 font-serif text-base italic text-[#b8860b] sm:text-lg">
                      {c.date}
                    </p>
                    <p className="story-chapter-body mt-5 max-w-md font-serif text-[1.1rem] leading-[1.95] text-ink/80 sm:text-[1.15rem] sm:leading-[2]">
                      {c.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="story-path-end relative mx-auto mt-16 h-3 w-3 sm:mt-20"
          aria-hidden
          style={{
            background: "radial-gradient(circle, #ffdf70 0%, transparent 70%)",
            boxShadow: "0 0 18px rgba(244,196,68,0.55)",
          }}
        />
      </div>

      <div className="relative z-[1] mx-auto max-w-3xl px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14">
        <p className="font-serif text-xl italic leading-relaxed text-[#b8860b] sm:text-2xl">
          {wedding.hero.closing}
        </p>
      </div>
    </section>
  );
}
