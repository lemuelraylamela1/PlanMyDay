"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  Fleuron,
  GoldDivider,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { LanternField } from "@/features/invitations/components/fairytale/lanterns";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";
import type { InvitationWedding } from "@/features/invitations/components/fairytale/types";

interface Detail {
  label: string;
  value: string;
  note?: string | null;
}

export function InvitationChapter({ wedding }: { wedding: InvitationWedding }) {
  const reveal = useReveal();
  const partner1 = wedding.partner1Name?.trim();
  const partner2 = wedding.partner2Name?.trim();

  const details = [
    wedding.dateLabel && { label: "The date", value: wedding.dateLabel },
    wedding.venueName && { label: "The venue", value: wedding.venueName, note: wedding.venueAddress },
    wedding.ceremonyTimeLabel && { label: "Ceremony", value: wedding.ceremonyTimeLabel },
    wedding.receptionTimeLabel && { label: "Reception", value: wedding.receptionTimeLabel },
  ].filter(Boolean) as Detail[];

  return (
    <section
      id="invitation"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28 text-center sm:pt-32"
      style={{ backgroundImage: pageParchment }}
    >
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

      <div className="relative flex w-full max-w-4xl flex-col items-center">
        <motion.div {...reveal(0.1)} className="mb-8">
          <Fleuron className="w-24 text-[#C9A66B]" />
        </motion.div>

        <motion.p {...reveal(0.2)} className={cn(smallCaps, "text-[#B76E79]")}>
          Together with their families
        </motion.p>

        <h1
          className={cn(
            displayFont,
            "mt-8 text-[clamp(2.85rem,10vw,6rem)] font-light leading-[0.94] tracking-[-0.02em] text-[#4a3236]",
          )}
        >
          {partner1 && partner2 ? (
            <>
              <motion.span {...reveal(0.4, 32)} className="block">
                {partner1}
              </motion.span>
              <motion.span
                {...reveal(0.65, 16)}
                className={cn(scriptFont, "my-2 block text-[0.48em] leading-none text-[#B76E79]")}
              >
                and
              </motion.span>
              <motion.span {...reveal(0.85, 32)} className="block">
                {partner2}
              </motion.span>
            </>
          ) : (
            <motion.span {...reveal(0.4, 32)} className="block text-balance">
              {wedding.coupleNames}
            </motion.span>
          )}
        </h1>

        <motion.p
          {...reveal(1.1)}
          className={cn(
            displayFont,
            "mt-10 max-w-lg text-balance text-xl italic leading-relaxed text-[#6d4a50] sm:text-2xl",
          )}
        >
          Request the honor of your presence as they begin their happily ever after.
        </motion.p>

        <motion.div {...reveal(1.3)} className="mt-12">
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
              <motion.div key={detail.label} {...reveal(1.4 + index * 0.12)} className="px-5 sm:py-2">
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

        <ChapterContinue href="#film" className="mt-20" revealProps={reveal(1.9, 12)}>
          Continue to the film
        </ChapterContinue>
      </div>
    </section>
  );
}
