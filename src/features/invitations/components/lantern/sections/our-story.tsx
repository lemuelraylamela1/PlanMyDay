"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart } from "lucide-react";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

export function OurStory() {
  const wedding = useLanternContent();
  const lineRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 70%", "end 60%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

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

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.story.eyebrow}
          title={wedding.story.title}
          intro={wedding.story.intro}
          theme="light"
        />

        <div ref={lineRef} className="relative mt-20">
          <div className="absolute left-4 top-0 h-full w-px bg-lantern-rose/10 md:left-1/2 md:-translate-x-1/2">
            <motion.div
              className="absolute inset-0 w-px"
              style={{
                background:
                  "linear-gradient(180deg, #e8829a 0%, #f4c444 60%, #e8c880 100%)",
                scaleY: lineScale,
                transformOrigin: "top",
              } as React.CSSProperties}
            />
          </div>

          <ol className="space-y-16">
            {wedding.story.chapters.map((c, i) => {
              const left = i % 2 === 0;
              return (
                <li key={i} className="relative">
                  <span
                    className="absolute left-4 top-2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full md:left-1/2"
                    style={{
                      background: "linear-gradient(135deg, #e8829a, #f4c444)",
                      boxShadow: "0 0 22px rgba(244,196,68,0.5), 0 0 44px rgba(232,130,154,0.28)",
                    }}
                  >
                    <Heart className="h-3.5 w-3.5 text-night" />
                  </span>

                  <div
                    className={`pl-12 md:w-1/2 md:pl-0 ${
                      left
                        ? "md:pr-16 md:text-right"
                        : "md:ml-auto md:pl-16 md:text-left"
                    }`}
                  >
                    <Reveal index={i} variant="float-in">
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="storybook-panel rounded-2xl p-6"
                        style={{ transformPerspective: 900 }}
                      >
                        <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.4em] text-lantern-rose/80">
                          {c.chapter}
                        </p>
                        <h3 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                          {c.title}
                        </h3>
                        <p className="mt-1 font-serif italic text-lantern" style={{ color: "#b8860b" }}>
                          {c.date}
                        </p>
                        <p className="mt-3 font-serif text-[1.05rem] leading-[1.9] text-ink/80">
                          {c.description}
                        </p>
                      </motion.div>
                    </Reveal>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <Reveal className="mt-16 text-center">
          <p className="font-serif text-xl italic" style={{ color: "#b8860b" }}>
            {wedding.hero.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
