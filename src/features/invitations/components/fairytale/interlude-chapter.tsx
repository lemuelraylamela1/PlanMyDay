"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { GoldDivider, displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay } from "@/features/invitations/components/fairytale/textures";
import { LanternField } from "@/features/invitations/components/fairytale/lanterns";

const dusk =
  "linear-gradient(180deg,#FBF6EE 0%,#eadfce 7%,#9b8d7c 15%,#4a5048 24%,#24312a 34%,#15221c 48%,#111c17 66%,#1b2922 82%,#596057 91%,#d8cdbd 97%,#FBF6EE 100%)";

const placeholderStory = [
  {
    eyebrow: "The beginning",
    title: "When our paths first crossed",
    body: "Our story began in the most unexpected way—a simple moment that quietly became the start of everything.",
  },
  {
    eyebrow: "The becoming",
    title: "A thousand little moments",
    body: "Through laughter, long conversations, and ordinary days made beautiful, we found a love that felt like home.",
  },
  {
    eyebrow: "The promise",
    title: "Forever starts here",
    body: "Now, surrounded by the people we cherish most, we begin our greatest adventure and choose each other for always.",
  },
];

function storyParagraphs(story: string | null) {
  if (!story?.trim()) return [];
  const blocks = story
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;
  return story
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function InterludeChapter({ story }: { story: string | null }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const reveal = useReveal();
  const reduceMotion = useReducedMotion();
  const paragraphs = storyParagraphs(story);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ["-4%", "8%"]);
  const ornamentY = useTransform(scrollYProgress, [0, 1], ["10%", "-12%"]);
  const chapters =
    paragraphs.length > 0
      ? paragraphs.map((body, index) => ({
          eyebrow: `Chapter ${String(index + 1).padStart(2, "0")}`,
          title: index === 0 ? "Where our story began" : index === paragraphs.length - 1 ? "And so our forever begins" : "A love made of moments",
          body,
        }))
      : placeholderStory;

  return (
    <section
      id="interlude"
      ref={sectionRef}
      className="relative overflow-hidden px-5 py-32 text-center text-[#F3E7D3] sm:px-8 sm:py-44"
      style={{ backgroundImage: dusk }}
    >
      <LanternField tone="dusk" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[22%] h-[58%] bg-[radial-gradient(ellipse_at_center,rgba(221,191,141,0.12),transparent_66%)]"
        style={reduceMotion ? undefined : { y: glowY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-[18%] top-[18%] h-40 bg-[radial-gradient(ellipse_at_center,rgba(221,191,141,0.16),transparent_70%)]"
        animate={reduceMotion ? undefined : { opacity: [0.4, 0.9, 0.4], scale: [1, 1.06, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: grainOverlay }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_52%,transparent_30%,rgba(5,12,9,0.5)_100%)]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <motion.div style={reduceMotion ? undefined : { y: ornamentY }}>
          <BotanicalSprig />
        </motion.div>
        <motion.p {...reveal(0.12)} className={cn(smallCaps, "mt-6 text-[#DDBF8D]")}>
          Our love story
        </motion.p>
        <motion.h2
          {...reveal(0.24, 24)}
          className={cn(displayFont, "mt-5 text-balance text-4xl font-light leading-[1.05] sm:text-7xl")}
        >
          Once upon a time,
          <span className="mt-2 block italic text-[#E8B8C7]">
            two hearts found their way home.
          </span>
        </motion.h2>
        <motion.div {...reveal(0.4)} className="mt-10">
          <GoldDivider tone="light" />
        </motion.div>

        <div className="relative mt-20 w-full max-w-2xl text-left sm:mt-28">
          <motion.span
            aria-hidden
            className="absolute bottom-6 left-[7px] top-6 w-px origin-top bg-gradient-to-b from-[#DDBF8D]/70 via-[#E8B8C7]/45 to-transparent sm:left-1/2"
            initial={reduceMotion ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 2.2, ease: fairytaleEase }}
          />

          <div className="space-y-20 sm:space-y-28">
            {chapters.map((chapter, index) => (
              <StoryMoment
                key={`${index}-${chapter.title}`}
                chapter={chapter}
                index={index}
              />
            ))}
          </div>
        </div>

        <motion.a
          {...reveal(0.25, 12)}
          href="#rsvp"
          className={cn(
            smallCaps,
            "mt-16 inline-flex flex-col items-center gap-3 text-[#DDBF8D]/75 transition-colors hover:text-[#DDBF8D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
          )}
        >
          Continue to RSVP
          <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-[#DDBF8D]/35">
            <motion.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-[#E8B8C7]"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: fairytaleEase }}
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}

function StoryMoment({
  chapter,
  index,
}: {
  chapter: { eyebrow: string; title: string; body: string };
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const alignRight = index % 2 === 1;

  return (
    <motion.article
      className={cn(
        "relative pl-10 sm:w-1/2 sm:pl-0",
        alignRight ? "sm:ml-auto sm:pl-12" : "sm:pr-12 sm:text-right",
      )}
      initial={reduceMotion ? false : { opacity: 0, x: alignRight ? 28 : -28, y: 16 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 1.1, ease: fairytaleEase }}
    >
      <motion.span
        aria-hidden
        className={cn(
          "absolute top-1.5 h-3.5 w-3.5 rotate-45 border border-[#DDBF8D] bg-[#17211c] shadow-[0_0_18px_rgba(221,191,141,0.45)]",
          "-left-0 sm:left-auto",
          alignRight ? "sm:-left-[7px]" : "sm:-right-[7px]",
        )}
        whileInView={reduceMotion ? undefined : { rotate: [45, 225], scale: [0.7, 1] }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: fairytaleEase }}
      />
      <p className={cn(smallCaps, "text-[9px] text-[#DDBF8D]/80")}>{chapter.eyebrow}</p>
      <h3 className={cn(displayFont, "mt-3 text-3xl font-light leading-tight text-[#F8EFE2] sm:text-4xl")}>
        {chapter.title}
      </h3>
      <p className={cn(displayFont, "mt-5 text-lg font-light italic leading-relaxed text-[#F3E7D3]/72 sm:text-xl")}>
        {chapter.body}
      </p>
    </motion.article>
  );
}

const sprigPaths = [
  "M30 196C46 160 60 128 92 96S150 40 176 14",
  "M58 152c-18-4-28-18-26-32 14 2 26 14 26 32Z",
  "M74 128c4-18 18-28 32-26-2 14-14 26-32 26Z",
  "M96 98c-18-6-26-20-22-34 14 4 24 18 22 34Z",
  "M118 76c6-17 21-25 34-21-4 13-18 23-34 21Z",
  "M140 54c-16-8-22-23-17-36 13 6 21 21 17 36Z",
];

function BotanicalSprig() {
  const reduceMotion = useReducedMotion();

  return (
    <svg aria-hidden viewBox="0 0 200 210" fill="none" className="h-28 w-28 text-[#DDBF8D]/80 sm:h-36 sm:w-36">
      {sprigPaths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={index === 0 ? 1.1 : 0.8}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: index === 0 ? 1.8 : 1.1,
            ease: fairytaleEase,
            delay: index === 0 ? 0 : 0.5 + index * 0.15,
          }}
        />
      ))}
      <circle cx="176" cy="14" r="2.2" fill="currentColor" />
    </svg>
  );
}
