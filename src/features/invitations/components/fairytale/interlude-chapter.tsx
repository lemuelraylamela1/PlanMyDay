"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useDepthLayer,
  useParallaxY,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import {
  GoldDivider,
  displayFont,
  interludeDisplay,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay } from "@/features/invitations/components/fairytale/textures";
import { LanternField } from "@/features/invitations/components/fairytale/lanterns";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
import { SceneTransition } from "@/features/invitations/components/fairytale/scene-transition";
import { fairytaleMedia, type FairytaleGalleryImage } from "@/features/invitations/components/fairytale/fairytale-media";

const dusk =
  "linear-gradient(180deg,#FBF6EE 0%,#eadfce 7%,#8a8498 16%,#4a4d68 26%,#2a2c45 36%,#22243A 50%,#1a1c2e 66%,#2f3148 82%,#7a7488 91%,#d8cdbd 97%,#FBF6EE 100%)";

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

/** Editorial plates drawn from existing prenup photographs — never stock. */
const storyPlateIndexes = [0, 3, 7] as const;

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
  const progress = useChapterScroll(sectionRef);
  const { y: glowY } = useDepthLayer(progress, "far");
  const { y: ornamentY } = useDepthLayer(progress, "near");
  const photos = fairytaleMedia.prenup.filter((photo) => Boolean(photo.src));
  const plates = storyPlateIndexes
    .map((index) => photos[index])
    .filter((photo): photo is FairytaleGalleryImage => Boolean(photo?.src));

  const chapters =
    paragraphs.length > 0
      ? paragraphs.map((body, index) => ({
          eyebrow: `Chapter ${String(index + 1).padStart(2, "0")}`,
          title:
            index === 0
              ? "Where our story began"
              : index === paragraphs.length - 1
                ? "And so our forever begins"
                : "A love made of moments",
          body,
        }))
      : placeholderStory;

  return (
    <section
      id="interlude"
      ref={sectionRef}
      data-scene="interlude"
      className="relative scroll-mt-16 overflow-hidden px-5 py-14 text-center text-[#F3E7D3] sm:scroll-mt-20 sm:px-8 sm:py-28"
      style={{ backgroundImage: dusk }}
    >
      <SceneTransition tone="forest" />
      <LanternField tone="dusk" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[22%] h-[58%]"
        style={{
          y: reduceMotion ? 0 : glowY,
          backgroundImage:
            "radial-gradient(ellipse at center, rgba(232,212,168,0.14), transparent 66%), radial-gradient(ellipse at 30% 40%, rgba(201,184,232,0.05), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[18%] top-[18%] h-40 bg-[radial-gradient(ellipse_at_center,rgba(232,184,199,0.1),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: grainOverlay }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_52%,transparent_30%,rgba(26,28,46,0.55)_100%)]"
      />

      <div data-scene-content className="relative mx-auto flex max-w-5xl flex-col items-center">
        <motion.div style={reduceMotion ? undefined : { y: ornamentY }}>
          <BotanicalSprig />
        </motion.div>
        <motion.p {...reveal(0.12)} className={cn(smallCaps, "mt-6 text-[#E8D4A8]")}>
          Our love story
        </motion.p>
        <motion.h2
          {...reveal(0.24, 24)}
          className={cn(displayFont, interludeDisplay, "mt-5 max-w-3xl text-balance")}
        >
          Once upon a time,
          <span className="mt-2 block italic text-[#E8B8C7]">
            two hearts found their way home.
          </span>
        </motion.h2>
        <motion.p
          {...reveal(0.34)}
          className={cn(displayFont, "mt-6 max-w-xl text-base font-light italic leading-relaxed text-[#F3E7D3]/68 sm:text-lg")}
        >
          A quiet chronicle of how we found each other—told in soft light, lingering glances, and the moments that became forever.
        </motion.p>
        <motion.div {...reveal(0.44)} className="mt-10">
          <GoldDivider tone="light" />
        </motion.div>

        {plates[0] && (
          <EditorialOpener photo={plates[0]} progress={progress} />
        )}

        <div className="relative mt-12 w-full sm:mt-16">
          <div className="space-y-12 sm:space-y-20">
            {chapters.map((chapter, index) => {
              const plate = plates.length > 0 ? plates[(index + 1) % plates.length] : undefined;
              return (
                <StorySpread
                  key={`${index}-${chapter.title}`}
                  chapter={chapter}
                  index={index}
                  photo={plate}
                />
              );
            })}
          </div>
        </div>

        <ChapterContinue href="#rsvp" tone="dusk" className="mt-14 sm:mt-16" revealProps={reveal(0.25, 12)}>
          Continue to RSVP
        </ChapterContinue>
      </div>
    </section>
  );
}

function EditorialOpener({
  photo,
  progress,
}: {
  photo: FairytaleGalleryImage;
  progress: ReturnType<typeof useChapterScroll>;
}) {
  const reduceMotion = useReducedMotion();
  const imageY = useParallaxY(progress, "-2.5%", "3.5%");

  return (
    <motion.figure
      className="relative mt-10 w-full overflow-hidden sm:mt-14"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.2, ease: fairytaleEase }}
    >
      <div className="relative aspect-[5/3] w-full overflow-hidden bg-[#1a1c2e] sm:aspect-[21/9]">
        <motion.div
          className="absolute inset-x-0 bottom-[-6%] top-[-6%]"
          style={
            {
              ...(reduceMotion ? {} : { y: imageY }),
              "--mobile-position": photo.mobileObjectPosition ?? "50% 38%",
              "--desktop-position": photo.objectPosition ?? "50% 45%",
            } as React.CSSProperties
          }
        >
          {photo.src && (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 64rem, 100vw"
              quality={82}
              className="object-cover [object-position:var(--mobile-position)] sm:[object-position:var(--desktop-position)]"
            />
          )}
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,28,46,0.15)_0%,transparent_35%,rgba(26,28,46,0.72)_100%)]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col items-start px-5 py-6 text-left sm:px-8 sm:py-8">
          <p className={cn(smallCaps, "text-[#E8D4A8]/85")}>Chapter zero</p>
          <p className={cn(displayFont, "mt-2 max-w-md text-2xl font-light italic leading-snug text-[#F8EFE2] sm:text-3xl")}>
            Before the vows, there was us.
          </p>
        </figcaption>
      </div>
    </motion.figure>
  );
}

function StorySpread({
  chapter,
  index,
  photo,
}: {
  chapter: { eyebrow: string; title: string; body: string };
  index: number;
  photo?: FairytaleGalleryImage;
}) {
  const reduceMotion = useReducedMotion();
  const photoLeft = index % 2 === 0;

  return (
    <motion.article
      className={cn(
        "grid items-center gap-8 sm:gap-10",
        photo?.src ? "md:grid-cols-12" : "mx-auto max-w-2xl",
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 1.05, ease: fairytaleEase }}
    >
      {photo?.src && (
        <StoryPlate
          photo={photo}
          className={cn(
            "md:col-span-7",
            photoLeft ? "md:order-1" : "md:order-2",
            index % 3 === 1 && "md:col-span-6 md:translate-y-6",
            index % 3 === 2 && "md:col-span-8",
          )}
          tall={index % 3 !== 1}
        />
      )}

      <div
        className={cn(
          "text-left",
          photo?.src
            ? cn(
                "md:col-span-5",
                photoLeft ? "md:order-2 md:pl-2" : "md:order-1 md:pr-2 md:text-right",
                index % 3 === 2 && "md:col-span-4",
              )
            : "text-center",
        )}
      >
        <p className={cn(smallCaps, "text-[9px] text-[#E8D4A8]/80")}>{chapter.eyebrow}</p>
        <h3 className={cn(displayFont, "mt-3 text-3xl font-light leading-tight text-[#F8EFE2] sm:text-4xl")}>
          {chapter.title}
        </h3>
        <p
          className={cn(
            displayFont,
            "mt-5 text-lg font-light italic leading-relaxed text-[#F3E7D3]/72 sm:text-xl",
            photo?.src && !photoLeft && "md:ml-auto",
            "max-w-md",
            !photo?.src && "mx-auto",
          )}
        >
          {chapter.body}
        </p>
      </div>
    </motion.article>
  );
}

function StoryPlate({
  photo,
  className,
  tall,
}: {
  photo: FairytaleGalleryImage;
  className?: string;
  tall?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("group relative overflow-hidden bg-[#1a1c2e]", className)}
      whileHover={reduceMotion ? undefined : { scale: 1.004 }}
      transition={{ duration: 0.65, ease: fairytaleEase }}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          tall ? "aspect-[4/5] sm:aspect-[3/4]" : "aspect-[5/4] sm:aspect-[4/3]",
        )}
      >
        <div
          className="absolute inset-0"
          style={
            {
              "--mobile-position": photo.mobileObjectPosition ?? "50% 36%",
              "--desktop-position": photo.objectPosition ?? "50% 42%",
            } as React.CSSProperties
          }
        >
          <Image
            src={photo.src!}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 48vw, 92vw"
            quality={80}
            className="object-cover [object-position:var(--mobile-position)] transition-transform duration-[1.35s] ease-out motion-safe:group-hover:scale-[1.03] sm:[object-position:var(--desktop-position)]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(26,28,46,0.55)_100%)] opacity-80 transition-opacity duration-700 group-hover:opacity-95"
        />
        {photo.caption && (
          <p
            className={cn(
              smallCaps,
              "absolute bottom-4 left-4 text-[#E8D4A8]/75 transition-opacity duration-500 group-hover:opacity-100 sm:bottom-5 sm:left-5",
            )}
          >
            Plate {photo.caption}
          </p>
        )}
      </div>
    </motion.div>
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
