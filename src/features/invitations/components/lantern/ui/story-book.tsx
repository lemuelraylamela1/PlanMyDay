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
      <span
        aria-hidden
        className="story-book-cover-vignette pointer-events-none absolute inset-0"
      />

      <span
        aria-hidden
        className="story-book-foil pointer-events-none absolute inset-[10px] rounded-[4px] sm:inset-3"
      />
      <span
        aria-hidden
        className="story-book-foil-inner pointer-events-none absolute inset-[14px] rounded-[2px] sm:inset-[18px]"
      />
      <span aria-hidden className="story-book-corner story-book-corner-tl" />
      <span aria-hidden className="story-book-corner story-book-corner-tr" />
      <span aria-hidden className="story-book-corner story-book-corner-bl" />
      <span aria-hidden className="story-book-corner story-book-corner-br" />

      <div className="relative z-[1] flex w-full flex-col items-center px-2">
        <p className="hidden font-cinzel text-[8px] font-semibold uppercase tracking-[0.46em] text-[#f0c4cc] sm:block sm:text-[9px] sm:tracking-[0.5em]">
          Once upon a time
        </p>

        <div
          aria-hidden
          className="story-book-lantern relative mt-4 h-[3.6rem] w-[2.55rem] sm:mt-5 sm:h-[4.35rem] sm:w-[3.1rem]"
        >
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
            <path d="M28 52 H72" stroke="rgba(255,250,230,0.28)" strokeWidth="1" />
            <path d="M30 72 H70" stroke="rgba(255,250,230,0.2)" strokeWidth="1" />
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

        <p className="mt-4 hidden font-cinzel text-[7.5px] uppercase tracking-[0.4em] text-[#fdf6ec]/62 sm:mt-5 sm:block sm:text-[8px] sm:tracking-[0.42em]">
          Open &amp; turn the pages
        </p>
      </div>
    </div>
  );
}

function ClosingEndpaper() {
  return (
    <div className="story-book-endpaper relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
      <span
        aria-hidden
        className="parchment-grain pointer-events-none absolute inset-0 opacity-70"
      />
      <p className="relative font-cinzel text-[9px] font-semibold uppercase tracking-[0.4em] text-[#9a6b3a]">
        Dedication
      </p>
      <p className="relative mt-4 max-w-[18ch] font-serif text-[0.95rem] italic leading-relaxed text-[#4a3218]">
        For every night the lanterns rose a little higher for us.
      </p>
    </div>
  );
}

function displayStill(src: string) {
  return src.replace(/\.gif$/i, ".jpg").replace(/\.(jpe?g|png)$/i, ".webp");
}

function ChapterPhoto({ chapter }: { chapter: StoryChapter }) {
  const [useOriginal, setUseOriginal] = React.useState(false);
  const zoom = chapter.imageZoom ?? 1;
  const src = useOriginal
    ? chapter.imageSrc.replace(/\.gif$/i, ".jpg")
    : displayStill(chapter.imageSrc);
  // Size/position zoom — never transform:scale. Scale escapes overflow clipping
  // inside PageFlip's preserve-3d leaves and ghosts across the spine.
  const zoomInset = zoom !== 1 ? `${(-(zoom - 1) / 2) * 100}%` : undefined;
  const zoomSize = zoom !== 1 ? `${zoom * 100}%` : undefined;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-[#1a0f2e]"
      style={{ transformStyle: "flat", clipPath: "inset(0)" }}
    >
      <img
        src={src}
        alt={chapter.imageAlt}
        className="absolute object-cover"
        style={
          zoom !== 1
            ? {
                width: zoomSize,
                height: zoomSize,
                maxWidth: "none",
                left: zoomInset,
                top: zoomInset,
              }
            : { inset: 0, width: "100%", height: "100%" }
        }
        draggable={false}
        decoding="async"
        onError={() => setUseOriginal(true)}
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

const STORY_DRAG_AXIS_SLOP = 8;
/** Slow crawl so guests can read without fighting page turns. */
const STORY_AUTO_SCROLL_PX_PER_SEC = 10;

/**
 * Transform-based vertical reading (native overflow is flaky inside PageFlip
 * transforms). Never capture pointers or stopPropagation — those blocked
 * horizontal page turns after the first vertical scroll on mobile.
 */
function ChapterParchment({
  chapter,
  index,
  total,
}: {
  chapter: StoryChapter;
  index: number;
  total: number;
}) {
  const { compact } = useLanternPerf();
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const offsetRef = React.useRef(0);
  const maxOffsetRef = React.useRef(0);
  const frameRef = React.useRef<number | null>(null);
  const lastTsRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef(false);
  const resumeTimerRef = React.useRef<number | null>(null);
  const onScreenRef = React.useRef(false);
  const dragRef = React.useRef<{
    pointerId: number;
    startY: number;
    startX: number;
    origin: number;
    axis: "vertical" | "horizontal" | null;
  } | null>(null);

  const applyOffset = React.useCallback((next: number) => {
    const max = Math.max(0, maxOffsetRef.current);
    const clamped = Math.max(0, Math.min(max, next));
    offsetRef.current = clamped;
    const content = contentRef.current;
    if (content) content.style.transform = `translate3d(0, ${-clamped}px, 0)`;
    return clamped;
  }, []);

  const measure = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return 0;
    const max = Math.max(0, content.scrollHeight - viewport.clientHeight);
    maxOffsetRef.current = max;
    applyOffset(offsetRef.current);
    return max;
  }, [applyOffset]);

  const stopLoop = React.useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastTsRef.current = null;
  }, []);

  const tick = React.useCallback(
    (now: number) => {
      if (pausedRef.current || !onScreenRef.current) {
        frameRef.current = null;
        return;
      }
      const max = maxOffsetRef.current;
      if (max <= 1) {
        frameRef.current = null;
        return;
      }
      if (lastTsRef.current == null) lastTsRef.current = now;
      const dt = Math.min(48, now - lastTsRef.current) / 1000;
      lastTsRef.current = now;
      const next = applyOffset(offsetRef.current + STORY_AUTO_SCROLL_PX_PER_SEC * dt);
      if (next < max - 0.5) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    },
    [applyOffset],
  );

  const startAuto = React.useCallback(() => {
    if (pausedRef.current || !onScreenRef.current) return;
    const max = measure();
    if (max <= 1) return;
    if (offsetRef.current >= max - 0.5) return;
    if (frameRef.current != null) return;
    lastTsRef.current = null;
    frameRef.current = requestAnimationFrame(tick);
  }, [measure, tick]);

  const pauseAuto = React.useCallback(() => {
    pausedRef.current = true;
    stopLoop();
    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, [stopLoop]);

  const scheduleResume = React.useCallback(() => {
    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      resumeTimerRef.current = null;
      pausedRef.current = false;
      startAuto();
    }, 1400);
  }, [startAuto]);

  React.useEffect(() => {
    measure();
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      measure();
      if (!pausedRef.current) startAuto();
    });
    ro.observe(viewport);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [measure, startAuto, chapter.description, chapter.title]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    let kick: number | null = null;
    let wasOnScreen = false;
    if (!viewport || typeof IntersectionObserver === "undefined") {
      onScreenRef.current = true;
      startAuto();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const nowOn = Boolean(entry?.isIntersecting);
        if (kick != null) {
          window.clearTimeout(kick);
          kick = null;
        }
        if (!nowOn) {
          onScreenRef.current = false;
          wasOnScreen = false;
          stopLoop();
          return;
        }
        const justEntered = !wasOnScreen;
        onScreenRef.current = true;
        wasOnScreen = true;
        // Only reset scroll when the page newly enters view — not on
        // threshold flicker while the guest swipes the invite up/down.
        if (justEntered) {
          offsetRef.current = 0;
          applyOffset(0);
          pausedRef.current = false;
          kick = window.setTimeout(() => {
            kick = null;
            startAuto();
          }, 420);
        } else if (!pausedRef.current) {
          startAuto();
        }
      },
      { threshold: [0.35, 0.55], rootMargin: "0px" },
    );
    io.observe(viewport);
    return () => {
      if (kick != null) window.clearTimeout(kick);
      io.disconnect();
      stopLoop();
    };
  }, [applyOffset, startAuto, stopLoop]);

  React.useEffect(
    () => () => {
      stopLoop();
      if (resumeTimerRef.current != null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    },
    [stopLoop],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    // Nothing to scroll inside the page — let the invite scroll freely.
    if (maxOffsetRef.current <= 1) return;
    pauseAuto();
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startX: event.clientX,
      origin: offsetRef.current,
      axis: null,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.axis === null) {
      if (Math.abs(dx) < STORY_DRAG_AXIS_SLOP && Math.abs(dy) < STORY_DRAG_AXIS_SLOP) {
        return;
      }
      // Prefer page scroll / page-turn over in-page crawl when intent is mixed.
      if (Math.abs(dx) * 1.15 >= Math.abs(dy)) {
        dragRef.current = null;
        scheduleResume();
        return;
      }
      drag.axis = "vertical";
    }

    if (drag.axis !== "vertical") return;
    // Keep PageFlip from seeing this move after we've claimed vertical reading.
    event.stopPropagation();
    applyOffset(drag.origin - dy);
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      scheduleResume();
      return;
    }
    dragRef.current = null;
    scheduleResume();
  };

  return (
    <div className="story-book-page relative h-full w-full min-h-0 overflow-hidden">
      {!compact ? (
        <span
          aria-hidden
          className="parchment-grain pointer-events-none absolute inset-0 opacity-80"
        />
      ) : null}
      <div
        ref={viewportRef}
        className="story-book-page-scroll absolute inset-0 z-[1] overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
        style={{ touchAction: "pan-y" }}
        role="region"
        aria-label="Chapter story. Drag up or down to read, sideways to turn pages."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
          pauseAuto();
          applyOffset(offsetRef.current + event.deltaY);
          scheduleResume();
        }}
      >
        <div
          ref={contentRef}
          className="will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <p className="font-cinzel text-[9px] font-semibold uppercase tracking-[0.36em] text-[#b06b7a]">
            {chapter.chapter}
          </p>
          <h4 className="mt-2 font-display text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-[#2a1540] sm:text-[1.5rem]">
            {chapter.title}
          </h4>
          <p className="mt-1 font-serif text-sm italic text-[#9a6b3a]">{chapter.date}</p>
          <p className="mt-3 font-serif text-[0.86rem] leading-[1.7] text-[#2B1B0E] sm:text-[0.92rem] sm:leading-[1.75]">
            {chapter.description}
          </p>
          <p className="mt-4 font-cinzel text-[8px] uppercase tracking-[0.32em] text-[#4a3218]/90">
            {index + 1} / {total}
            <span className="ml-2 normal-case tracking-normal text-[#4a3218]/90">
              · drag to read
            </span>
          </p>
          <div aria-hidden className="h-16 sm:h-10" />
        </div>
      </div>
    </div>
  );
}

/** Build leaves so each chapter is a full spread with alternating layout. */
function buildStoryLeaves(chapters: StoryChapter[], coverFront: React.ReactNode): PageFlipLeaf[] {
  // Odd chapters (1,3,5): image left, text right
  // Even chapters (2,4): text left, image right
  const sides = chapters.map((chapter, index) => {
    const imageLeft = index % 2 === 0;
    const photo = <ChapterPhoto chapter={chapter} />;
    const text = <ChapterParchment chapter={chapter} index={index} total={chapters.length} />;
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

  const [frameWidth, setFrameWidth] = React.useState<number | null>(null);
  React.useEffect(() => {
    const read = () => setFrameWidth(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const fitted = Math.floor(((frameWidth ?? 390) - 28) / 2);
  const pageWidth = compact ? Math.max(136, Math.min(172, fitted)) : 290;
  const pageHeight = compact ? 280 : 410;

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
        className="relative mx-auto flex w-full max-w-full items-center justify-center overflow-visible py-6 sm:py-10"
        style={{ minHeight: pageHeight + 24 }}
      >
        {!compact ? (
          <div
            aria-hidden
            className="story-book-glow pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[min(130%,36rem)] -translate-x-1/2 -translate-y-[42%]"
          />
        ) : null}
        <PageFlip
          pages={pages}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          pageRadius={6}
          pageColor="#f3e2c0"
          perspective={compact ? 800 : 1300}
          spineShift={0}
          turnAngle={180}
          peekAngle={0}
          duration={compact ? 0.4 : 0.55}
          stagger={0}
          ease="easeInOut"
          shadow={compact ? 0.12 : 0.34}
          trigger="click"
          closeOnLeave={false}
          interactive
          flat
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
        <p className="font-cinzel text-[12px] font-semibold uppercase tracking-[0.3em] text-[#f0c8d0]">
          {atEnd ? "The end" : hintQuiet ? "Keep turning" : "This is a storybook"}
        </p>
        <p className="max-w-[28ch] font-serif text-base leading-relaxed text-cream/90">
          {atEnd
            ? "Tap the left page, or drag right, to turn back through your story."
            : hintQuiet
              ? "Tap a page to turn — or drag left and right like a real book."
              : "Tap the book cover to open. Then tap a page, or drag left and right, to keep turning."}
        </p>
        <p className="font-cinzel text-[11px] uppercase tracking-[0.28em] text-cream/70">
          {chapterView} / {chapters.length}
        </p>
      </div>
    </div>
  );
}
