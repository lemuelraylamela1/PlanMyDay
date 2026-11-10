"use client";

import * as React from "react";
import { SectionHeading } from "../ui/section-heading";
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

/** Desktop zigzag + mobile-tight horizontal slots for chapter waypoints. */
function chapterSlot(index: number, total: number) {
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const top = 12 + t * 68;
  const leftDesktop = index % 2 === 0 ? 8 : 52;
  const leftMobile = index % 2 === 0 ? 4 : 18;
  return { top, leftDesktop, leftMobile };
}

export function OurStory() {
  const wedding = useLanternContent();
  const { reducedMotion } = useExperience();
  const { profile, compact, quality } = useLanternPerf();
  const pathRef = React.useRef<HTMLDivElement>(null);

  const chapters = wedding.story.chapters;
  const stageMinHeight = `${Math.max(220, chapters.length * 85)}vh`;
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

      <div className="relative z-[1] mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.story.eyebrow}
          title={wedding.story.title}
          intro={wedding.story.intro}
          theme="light"
        />
      </div>

      <div
        ref={pathRef}
        className="story-path relative z-[1] mx-auto mt-10 w-full max-w-5xl px-4 sm:mt-14 sm:px-6"
        style={{ minHeight: stageMinHeight }}
      >
        <div className="story-star-trail pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden />

        {/* Path start — wand begins here */}
        <div
          className="story-path-start absolute left-1/2 top-[4%] z-30 -translate-x-1/2"
          aria-hidden
        >
          <MagicWand />
          <span className="sr-only">Story path begins</span>
        </div>

        {chapters.map((c, i) => {
          const slot = chapterSlot(i, chapters.length);
          return (
            <article
              key={`${c.chapter}-${c.title}`}
              className={cn(
                "story-chapter absolute z-10 w-[min(88vw,20.5rem)] sm:w-[min(42vw,22rem)]",
                !enablePath && "is-lit",
              )}
              style={
                {
                  top: `${slot.top}%`,
                  ["--chapter-left-mobile" as string]: `${slot.leftMobile}%`,
                  ["--chapter-left-desktop" as string]: `${slot.leftDesktop}%`,
                } as React.CSSProperties
              }
            >
              <span className="story-chapter-marker" aria-hidden />
              <div className="storybook-panel story-chapter-panel rounded-2xl p-5 sm:p-6">
                <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.4em] text-lantern-rose/80">
                  {c.chapter}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                  {c.title}
                </h3>
                <p className="mt-1 font-serif italic text-lantern" style={{ color: "#b8860b" }}>
                  {c.date}
                </p>
                <p className="story-chapter-body mt-3 font-serif text-[1.05rem] leading-[1.9] text-ink/80">
                  {c.description}
                </p>
              </div>
            </article>
          );
        })}

        <div
          className="story-path-end absolute left-1/2 top-[96%] h-3 w-3 -translate-x-1/2 rounded-full"
          aria-hidden
          style={{
            background: "radial-gradient(circle, #ffdf70 0%, transparent 70%)",
            boxShadow: "0 0 18px rgba(244,196,68,0.55)",
          }}
        />
      </div>

      <div className="relative z-[1] mx-auto max-w-5xl px-4 pb-4 text-center sm:px-6">
        <p className="font-serif text-xl italic" style={{ color: "#b8860b" }}>
          {wedding.hero.closing}
        </p>
      </div>
    </section>
  );
}
