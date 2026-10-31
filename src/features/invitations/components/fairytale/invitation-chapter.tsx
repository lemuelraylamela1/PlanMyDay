"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  Fleuron,
  GoldDivider,
  displayFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { LanternField } from "@/features/invitations/components/fairytale/lanterns";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
import { SceneTransition } from "@/features/invitations/components/fairytale/scene-transition";
import type { InvitationWedding } from "@/features/invitations/components/fairytale/types";

interface Detail {
  label: string;
  value: string;
  note?: string | null;
}

export function InvitationChapter({ wedding }: { wedding: InvitationWedding }) {
  const reveal = useReveal();

  const details = [
    wedding.dateLabel && { label: "The date", value: wedding.dateLabel },
    wedding.venueName && { label: "The venue", value: wedding.venueName, note: wedding.venueAddress },
    wedding.ceremonyTimeLabel && { label: "Ceremony", value: wedding.ceremonyTimeLabel },
    wedding.receptionTimeLabel && { label: "Reception", value: wedding.receptionTimeLabel },
  ].filter(Boolean) as Detail[];

  return (
    <section
      id="invitation"
      data-scene="invitation"
      className="relative flex min-h-[100svh] scroll-mt-6 flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28 text-center sm:pt-32"
      style={{ backgroundImage: pageParchment }}
    >
      <SceneTransition tone="paper" />
      <LanternField />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: fairytaleAtmosphere.champagneMist }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] top-[12%] h-48 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, rgba(201,184,232,0.16), transparent 70%)",
        }}
      />

      <div data-scene-content className="relative flex w-full max-w-4xl flex-col items-center">
        <motion.div {...reveal(0.1)} className="mb-8">
          <Fleuron className="w-24 text-[#C9A66B]" />
        </motion.div>

        <motion.p {...reveal(0.18)} className={cn(smallCaps, "text-[#B76E79]")}>
          The celebration
        </motion.p>

        <motion.h2
          {...reveal(0.28, 24)}
          className={cn(
            displayFont,
            "mt-6 max-w-2xl text-balance text-[clamp(2.1rem,6vw,3.4rem)] font-light leading-[1.05] tracking-[-0.02em] text-[#4a3236]",
          )}
        >
          Join us for a day of love, laughter, and forever after.
        </motion.h2>

        <motion.p
          {...reveal(0.42)}
          className={cn(
            displayFont,
            "mt-6 max-w-md text-balance text-lg italic leading-relaxed text-[#6d4a50] sm:text-xl",
          )}
        >
          Your presence is the greatest gift as we begin this new chapter together.
        </motion.p>

        <motion.div {...reveal(0.55)} className="mt-12">
          <GoldDivider />
        </motion.div>

        {details.length > 0 && (
          <dl
            className={cn(
              "mt-14 grid w-full gap-12",
              details.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#DDBF8D]/55"
                : "sm:auto-cols-fr sm:grid-flow-col sm:gap-0 sm:divide-x sm:divide-[#DDBF8D]/55",
            )}
          >
            {details.map((detail, index) => (
              <motion.div key={detail.label} {...reveal(0.65 + index * 0.1)} className="px-5 sm:py-2">
                <dt className={cn(smallCaps, "text-[#9b7b62]")}>{detail.label}</dt>
                <dd className={cn(displayFont, "mt-3 text-2xl leading-snug text-[#4a3236]")}>{detail.value}</dd>
                {detail.note && (
                  <dd className={cn(displayFont, "mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#7a5d62]")}>
                    {detail.note}
                  </dd>
                )}
              </motion.div>
            ))}
          </dl>
        )}

        <ChapterContinue href="#film" className="mt-20" revealProps={reveal(1.1, 12)}>
          Continue to the film
        </ChapterContinue>
      </div>
    </section>
  );
}
