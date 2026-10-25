"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  GoldDivider,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
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
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24 text-center"
      style={{ backgroundImage: pageParchment }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 42% at 50% 0%, rgba(221,191,141,0.32), transparent 72%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, ease: fairytaleEase }}
      />

      <div className="relative flex w-full max-w-4xl flex-col items-center">
        <motion.p {...reveal(0.2)} className={cn(smallCaps, "text-[#B76E79]")}>
          Together with their families
        </motion.p>

        <h1
          className={cn(
            displayFont,
            "mt-10 text-[clamp(3rem,11vw,6.5rem)] font-light leading-[0.95] text-[#4a3236]",
          )}
        >
          {partner1 && partner2 ? (
            <>
              <motion.span {...reveal(0.4, 32)} className="block">
                {partner1}
              </motion.span>
              <motion.span
                {...reveal(0.65, 16)}
                className={cn(scriptFont, "my-3 block text-[0.5em] leading-none text-[#B76E79]")}
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
            "mt-10 max-w-md text-balance text-xl italic leading-relaxed text-[#6d4a50] sm:text-2xl",
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
              "mt-12 grid w-full gap-10",
              details.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#DDBF8D]/60"
                : "sm:auto-cols-fr sm:grid-flow-col sm:gap-0 sm:divide-x sm:divide-[#DDBF8D]/60",
            )}
          >
            {details.map((detail, index) => (
              <motion.div key={detail.label} {...reveal(1.4 + index * 0.12)} className="px-6 sm:py-2">
                <dt className={cn(smallCaps, "text-[#9b7b62]")}>{detail.label}</dt>
                <dd className={cn(displayFont, "mt-3 text-2xl leading-snug text-[#4a3236]")}>{detail.value}</dd>
                {detail.note && (
                  <dd className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#7a5d62]">{detail.note}</dd>
                )}
              </motion.div>
            ))}
          </dl>
        )}

        <motion.a
          {...reveal(1.9, 12)}
          href="#interlude"
          className={cn(
            smallCaps,
            "mt-20 inline-flex flex-col items-center gap-3 text-[#9b7b62] transition-colors hover:text-[#B76E79] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFDF8]",
          )}
        >
          Continue
          <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-[#DDBF8D]/40">
            <motion.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-[#B76E79]"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: fairytaleEase }}
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
