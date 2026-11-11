"use client";

import * as React from "react";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";
import { useLanternPerf } from "../performance/lantern-perf-provider";
import { DollyGallery } from "../ui/dolly-gallery";
import { getActiveLenis } from "../experience/lenis-bridge";

/** Engage the dolly once this stage owns most of the viewport. */
function useStageActive(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const coverage = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      const ratio = coverage / vh;
      // Active when the stage fills most of the screen and sits near the top
      setActive(ratio >= 0.7 && rect.top <= vh * 0.18);
    };

    measure();

    const io = new IntersectionObserver(
      () => measure(),
      { threshold: [0, 0.25, 0.5, 0.7, 0.85, 1] },
    );
    io.observe(el);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const lenis = getActiveLenis();
    lenis?.on("scroll", measure);

    let tries = 0;
    const poll = window.setInterval(() => {
      const late = getActiveLenis();
      if (late && late !== lenis) {
        late.on("scroll", measure);
        window.clearInterval(poll);
      } else if (++tries > 40) {
        window.clearInterval(poll);
      }
    }, 250);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.clearInterval(poll);
      lenis?.off("scroll", measure);
      getActiveLenis()?.off("scroll", measure);
    };
  }, [ref, enabled]);

  return active;
}

export function OurStory() {
  const wedding = useLanternContent();
  const { compact } = useLanternPerf();

  const chapters = wedding.story.chapters;

  const stageRef = React.useRef<HTMLDivElement>(null);
  const stageActive = useStageActive(stageRef, true);

  const dollyImages = React.useMemo(
    () => chapters.map((c) => ({ src: c.imageSrc, alt: c.imageAlt })),
    [chapters],
  );

  const dollyCaptions = React.useMemo(
    () =>
      chapters.map((c, i) => (
        <div key={c.imageSrc} className={compact ? "mx-auto max-w-[19.5rem]" : undefined}>
          <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.4em] text-[#e8b4bc]">
            {c.chapter}
          </p>
          <h3
            className={
              compact
                ? "mt-1.5 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-[#fdf6ec]"
                : "mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-cream sm:text-[1.85rem]"
            }
          >
            {c.title}
          </h3>
          <p
            className={
              compact
                ? "mt-0.5 font-serif text-sm italic text-[#f4c444]"
                : "mt-1 font-serif text-sm italic text-[#f4c444] sm:text-base"
            }
          >
            {c.date}
          </p>
          <p
            className={
              compact
                ? "mt-2 font-serif text-[0.9rem] leading-[1.65] text-[#fdf6ec]/90"
                : "mt-4 font-serif text-[0.92rem] leading-[1.75] text-cream/80 sm:text-[1rem] sm:leading-[1.85]"
            }
          >
            {c.description}
          </p>
          <p
            className={
              compact
                ? "mt-2.5 font-cinzel text-[9px] uppercase tracking-[0.35em] text-[#fdf6ec]/55"
                : "mt-5 font-cinzel text-[9px] uppercase tracking-[0.35em] text-cream/35"
            }
          >
            {i + 1} / {chapters.length}
            <span className="mx-2 opacity-40">·</span>
            {compact ? "Swipe or scroll" : "Scroll or drag"}
          </p>
        </div>
      )),
    [chapters, compact],
  );

  const itemWidth = compact ? 240 : 280;

  return (
    <section
      id="story"
      className="relative overflow-hidden lantern-section"
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
      <MagicDust count={20} intensity="soft" className="opacity-40" />
      <SceneAtmosphere tone="warm" className="opacity-40" />

      <header className="story-prologue relative z-[1] mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6">
        <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.45em] text-[#e8b4bc]">
          {wedding.story.eyebrow}
        </p>
        <h2 className="story-prologue-title mt-5 max-w-[14ch] font-display text-[2.35rem] font-light leading-[1.08] tracking-[-0.03em] text-cream min-[380px]:text-4xl sm:max-w-none sm:text-6xl md:text-[4.25rem]">
          {wedding.story.title}
        </h2>
        <p className="mt-6 max-w-xl font-serif text-lg leading-[1.85] text-cream/70 sm:text-xl sm:leading-[1.9]">
          {wedding.story.intro}
        </p>
      </header>

      <div
        ref={stageRef}
        className="relative z-[1] mt-6 h-[min(100svh,920px)] w-full sm:mt-10"
      >
        <DollyGallery
          images={dollyImages}
          captions={dollyCaptions}
          captionLayout={compact ? "stack" : "side"}
          infinite={false}
          interactive={stageActive}
          itemWidth={itemWidth}
          aspectRatio={0.8}
          borderRadius={7}
          grayscale={0}
          perspective={compact ? 900 : 1000}
          spacing={compact ? 700 : 800}
          spread={compact ? 0.15 : 0.78}
          scatter={compact ? 0.02 : 0.08}
          revealRange={1.5}
          passRange={1}
          parallaxX={compact ? 0.04 : 0.1}
          parallaxY={compact ? 0.03 : 0.05}
          parallaxSmooth={0.85}
          tilt={compact ? 2 : 4}
          pulse={0.03}
          drift={0.08}
          smooth={0.85}
          wheelSpeed={1}
          dragSpeed={1.5}
          upcomingBlur={compact ? 10 : 14}
          backgroundColor="transparent"
          // Auto-fly once the section owns the screen; user scroll takes over
          autoScroll={stageActive ? (compact ? 55 : 70) : 0}
          pauseOnHover={false}
          className="h-full w-full"
        >
          {!stageActive ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 text-center">
              <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-cream/40">
                Keep scrolling
              </p>
            </div>
          ) : null}
        </DollyGallery>
      </div>

      <div className="relative z-[1] mx-auto max-w-3xl px-4 pb-6 pt-10 text-center sm:px-6 sm:pt-14">
        <p className="font-serif text-xl italic leading-relaxed text-[#f4c444] sm:text-2xl">
          {wedding.hero.closing}
        </p>
      </div>
    </section>
  );
}
