"use client";

import { FloatingLanterns } from "../effects/floating-lanterns";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";
import { useLanternPerf } from "../performance/lantern-perf-provider";
import { StoryBook } from "../ui/story-book";

export function OurStory() {
  const wedding = useLanternContent();
  const { compact } = useLanternPerf();

  return (
    <section
      id="story"
      className="relative overflow-x-clip lantern-section"
      style={{ backgroundColor: "var(--color-night)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 18%, rgba(244,196,68,0.12) 0%, transparent 55%), linear-gradient(180deg, rgba(30,15,58,0.9) 0%, rgba(13,7,32,1) 42%, rgba(13,7,32,1) 100%)",
        }}
      />
      <FloatingLanterns
        count={compact ? 10 : 14}
        intensity="festival"
        sizeScale={compact ? 0.55 : 0.62}
        className="z-0 opacity-70 max-sm:opacity-55"
      />
      <MagicDust count={20} intensity="soft" className="opacity-40" />
      <SceneAtmosphere tone="warm" className="opacity-40" />

      <header className="story-prologue relative z-[1] mx-auto max-w-4xl px-4 pt-4 text-center sm:px-6 sm:pt-6">
        <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.45em] text-[#e8b4bc]">
          {wedding.story.eyebrow}
        </p>
        <h2 className="story-prologue-title mx-auto mt-5 max-w-[14ch] font-display text-[2.35rem] font-light leading-[1.08] tracking-[-0.03em] text-cream min-[380px]:text-4xl sm:max-w-none sm:text-6xl md:text-[4.25rem]">
          {wedding.story.title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-[1.85] text-cream/70 sm:text-xl sm:leading-[1.9]">
          {wedding.story.intro}
        </p>
      </header>

      <div className="relative z-[1] mt-4 w-full px-3 sm:mt-8 sm:px-6">
        <StoryBook />
      </div>

      <div className="relative z-[1] mx-auto max-w-3xl px-4 pb-6 pt-8 text-center sm:px-6 sm:pt-12">
        <p className="font-serif text-xl italic leading-relaxed text-[#f4c444] sm:text-2xl">
          {wedding.hero.closing}
        </p>
      </div>
    </section>
  );
}
