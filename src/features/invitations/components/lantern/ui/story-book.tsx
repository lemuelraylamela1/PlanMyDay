"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import { coupleNames, type StoryChapter } from "../config/wedding-defaults";
import { useLanternContent } from "../content-context";
import { useLanternPerf } from "../performance/lantern-perf-provider";
import { PageFlip, type PageFlipLeaf } from "./page-flip";
import { cn } from "@/lib/utils";

function CoverFront({ title, names }: { title: string; names: string }) {
  return (
    <div className="story-book-cover relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-5">
      <span aria-hidden className="story-book-cover-glow pointer-events-none absolute inset-0" />
      <span aria-hidden className="story-book-cover-stars pointer-events-none absolute inset-0" />
      <span aria-hidden className="story-book-cover-vignette pointer-events-none absolute inset-0" />

      <span aria-hidden className="story-book-foil pointer-events-none absolute inset-[10px] rounded-[4px] sm:inset-3" />
      <span aria-hidden className="story-book-foil-inner pointer-events-none absolute inset-[14px] rounded-[2px] sm:inset-[18px]" />
      <span aria-hidden className="story-book-corner story-book-corner-tl" />
      <span aria-hidden className="story-book-corner story-book-corner-tr" />
      <span aria-hidden className="story-book-corner story-book-corner-bl" />
      <span aria-hidden className="story-book-corner story-book-corner-br" />

      <div className="relative z-[1] flex w-full flex-col items-center px-2">
        <p className="font-cinzel text-[8px] font-semibold uppercase tracking-[0.46em] text-[#f0c4cc] sm:text-[9px] sm:tracking-[0.5em]">
          Once upon a time
        </p>

        <div aria-hidden className="story-book-lantern relative mt-4 h-[3.6rem] w-[2.55rem] sm:mt-5 sm:h-[4.35rem] sm:w-[3.1rem]">
          <span className="story-book-lantern-glow absolute left-1/2 top-[58%] h-[120%] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <svg viewBox="0 0 100 140" className="relative h-full w-full">
            <defs>
              <radialGradient id="coverLanternBody" cx="50%" cy="78%" r="65%">
                <stop offset="0%" stopColor="#fffaf0" />
                <stop offset="42%" stopColor="#ffdf70" />
                <stop offset="100%" stopColor="#d98736" />
              </radialGradient>
              <radialGradient id="coverLanternFlame" cx="50%" cy="55%" r="58%">
                <stop offset="0%" stopColor="#fffaf0" />
                <stop offset="100%" stopColor="#ff9d3c" />
              </radialGradient>
              <linearGradient id="coverLanternCap" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffe9a8" />
                <stop offset="100%" stopColor="#c9891f" />
              </linearGradient>
            </defs>
            <path
              d="M50 4 C46 4 43 7 43 11 L43 16 L57 16 L57 11 C57 7 54 4 50 4Z"
              fill="url(#coverLanternCap)"
              opacity="0.95"
            />
            <path
              d="M38 16 H62"
              stroke="#ffdf70"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M50 16 C28 16 16 32 16 58 C16 86 26 108 39 118 L61 118 C74 108 84 86 84 58 C84 32 72 16 50 16Z"
              fill="url(#coverLanternBody)"
              stroke="#ffdf70"
              strokeOpacity="0.7"
              strokeWidth="1.4"
            />
            <path
              d="M50 98 C44 106 45 116 50 122 C56 116 56 106 50 98Z"
              fill="url(#coverLanternFlame)"
            />
            <path
              d="M28 52 H72"
              stroke="rgba(255,250,230,0.28)"
              strokeWidth="1"
            />
            <path
              d="M30 72 H70"
              stroke="rgba(255,250,230,0.2)"
              strokeWidth="1"
            />
          </svg>
        </div>

        <span
          aria-hidden
          className="story-book-ornament mt-4 h-3 w-[4.5rem] sm:mt-5 sm:w-[5.5rem]"
        />

        <h3 className="story-book-cover-title relative mt-3 max-w-[11ch] font-display text-[1.7rem] font-light leading-[1.05] tracking-[-0.025em] sm:mt-4 sm:text-[2rem]">
          {title}
        </h3>

        <p className="story-book-cover-names relative mt-2.5 font-script text-[1.35rem] leading-none sm:mt-3 sm:text-[1.65rem]">
          {names}
        </p>

        <span
          aria-hidden
          className="story-book-ornament mt-4 h-3 w-[3.25rem] opacity-80 sm:mt-5 sm:w-16"
        />

        <p className="mt-4 font-cinzel text-[7.5px] uppercase tracking-[0.4em] text-[#fdf6ec]/62 sm:mt-5 sm:text-[8px] sm:tracking-[0.42em]">
          Open &amp; turn the pages
        </p>
      </div>
    </div>
  );
}

function ClosingEndpaper() {
  return (
    <div className="story-book-endpaper relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
      <span aria-hidden className="parchment-grain pointer-events-none absolute inset-0 opacity-70" />
      <p className="relative font-cinzel text-[9px] font-semibold uppercase tracking-[0.4em] text-[#9a6b3a]">
        Dedication
      </p>
      <p className="relative mt-4 max-w-[18ch] font-serif text-[0.95rem] italic leading-relaxed text-[#4a3218]">
        For every night the lanterns rose a little higher for us.
      </p>
    </div>
  );
}

function ChapterPhoto({ chapter }: { chapter: StoryChapter }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#1a0f2e]">
      <img
        src={chapter.imageSrc}
        alt={chapter.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,7,32,0.15) 0%, rgba(13,7,32,0.05) 40%, rgba(13,7,32,0.78) 100%)",
        }}
      />
      <div className="relative mt-auto px-4 pb-4 pt-10">
        <p className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.36em] text-[#e8b4bc]">
          {chapter.chapter}
        </p>
        <p className="mt-1 font-display text-lg font-semibold leading-tight tracking-[-0.02em] text-[#fdf6ec]">
          {chapter.title}
        </p>
      </div>
    </div>
  );
}

function ChapterParchment({
  chapter,
  index,
  total,
}: {
  chapter: StoryChapter;
  index: number;
  total: number;
}) {
  return (
    <div className="story-book-page relative flex h-full w-full flex-col overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
      <span aria-hidden className="parchment-grain pointer-events-none absolute inset-0 opacity-80" />
      <p className="relative font-cinzel text-[9px] font-semibold uppercase tracking-[0.36em] text-[#b06b7a]">
        {chapter.chapter}
      </p>
      <h4 className="relative mt-2 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-[#2a1540] sm:text-[1.5rem]">
        {chapter.title}
      </h4>
      <p className="relative mt-1 font-serif text-sm italic text-[#9a6b3a]">{chapter.date}</p>
      <p className="relative mt-3 flex-1 font-serif text-[0.86rem] leading-[1.7] text-[#4a3218] sm:text-[0.92rem] sm:leading-[1.75]">
        {chapter.description}
      </p>
      <p className="relative mt-3 font-cinzel text-[8px] uppercase tracking-[0.32em] text-[#9a6b3a]/70">
        {index + 1} / {total}
      </p>
    </div>
  );
}

/** Build leaves so each chapter is a full spread with alternating layout. */
function buildStoryLeaves(
  chapters: StoryChapter[],
  coverFront: React.ReactNode,
): PageFlipLeaf[] {
  // Odd chapters (1,3,5): image left, text right
  // Even chapters (2,4): text left, image right
  const sides = chapters.map((chapter, index) => {
    const imageLeft = index % 2 === 0;
    const photo = <ChapterPhoto chapter={chapter} />;
    const text = (
      <ChapterParchment chapter={chapter} index={index} total={chapters.length} />
    );
    return {
      left: imageLeft ? photo : text,
      right: imageLeft ? text : photo,
      alt: chapter.imageAlt,
    };
  });

  if (sides.length === 0) {
    return [
      {
        id: "cover",
        alt: "Our story book cover",
        front: coverFront,
        back: <ClosingEndpaper />,
      },
    ];
  }

  const first = sides[0]!;
  const leaves: PageFlipLeaf[] = [
    {
      id: "cover",
      alt: "Our story book cover",
      front: coverFront,
      back: first.left,
    },
  ];

  for (let i = 0; i < sides.length; i++) {
    const side = sides[i]!;
    const next = sides[i + 1];
    leaves.push({
      id: `spread-${i + 1}`,
      alt: side.alt,
      front: side.right,
      back: next ? next.left : <ClosingEndpaper />,
    });
  }

  return leaves;
}

export function StoryBook({ className }: { className?: string }) {
  const wedding = useLanternContent();
  const { compact } = useLanternPerf();
  const chapters = wedding.story.chapters;
  const [turned, setTurned] = React.useState(0);
  const hasTurned = turned > 0;

  const pageWidth = compact ? 168 : 290;
  const pageHeight = compact ? 248 : 410;

  const pages = React.useMemo(
    () =>
      buildStoryLeaves(
        chapters,
        <CoverFront title={wedding.story.eyebrow} names={coupleNames(wedding, "&")} />,
      ),
    [chapters, wedding],
  );

  const chapterView = turned === 0 ? 0 : Math.min(chapters.length, turned);
  const atEnd = pages.length > 0 && turned >= pages.length;
  const hintQuiet = hasTurned;

  return (
    <div className={cn("story-book relative mx-auto flex w-full flex-col items-center", className)}>
      <div
        className="relative mx-auto flex w-full max-w-full items-center justify-center overflow-x-clip overflow-y-visible py-6 sm:py-10"
        style={{ minHeight: pageHeight + 24 }}
      >
        <div
          aria-hidden
          className="story-book-glow pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[min(130%,36rem)] -translate-x-1/2 -translate-y-[42%]"
        />
        <PageFlip
          pages={pages}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          pageRadius={6}
          pageColor="#f3e2c0"
          perspective={compact ? 1000 : 1300}
          spineShift={0}
          turnAngle={180}
          peekAngle={8}
          duration={0.55}
          stagger={0.07}
          ease="easeInOut"
          shadow={0.34}
          trigger="click"
          closeOnLeave={false}
          interactive
          onTurnedChange={setTurned}
          className="relative z-[1] mx-auto shrink-0"
        />
      </div>

      <div
        className={cn(
          "story-book-hint relative z-[1] mb-2 flex flex-col items-center gap-2 px-4 text-center transition-opacity duration-500",
          hintQuiet ? "opacity-55" : "opacity-100",
        )}
      >
        <div className="story-book-hint-icon flex h-11 w-11 items-center justify-center rounded-full border border-[#f4c444]/35 bg-[rgba(30,15,58,0.55)] text-[#f4c444] shadow-[0_0_24px_rgba(244,196,68,0.18)]">
          <BookOpen className="h-5 w-5" strokeWidth={1.6} aria-hidden />
        </div>
        <p className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.38em] text-[#e8b4bc]">
          {atEnd ? "The end" : hintQuiet ? "Keep turning" : "This is a storybook"}
        </p>
        <p className="max-w-[22ch] font-serif text-sm leading-relaxed text-cream/70">
          {atEnd
            ? "Drag the page right — or tap — to turn back through your story."
            : hintQuiet
              ? "Drag a page like a real book, or tap to turn."
              : "Grab a page and drag to turn — just like a real storybook."}
        </p>
        <p className="font-cinzel text-[9px] uppercase tracking-[0.32em] text-cream/40">
          {chapterView} / {chapters.length}
        </p>
      </div>
    </div>
  );
}
