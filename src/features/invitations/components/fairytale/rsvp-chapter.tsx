"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useDepthLayer,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import {
  Fleuron,
  GoldDivider,
  displayFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { LanternField } from "@/features/invitations/components/fairytale/lanterns";
import { RsvpForm } from "@/features/invitations/components/rsvp-form";
import type {
  InvitationGuest,
  InvitationResponse,
  InvitationWedding,
} from "@/features/invitations/components/fairytale/types";

interface Props {
  token: string;
  guest: InvitationGuest;
  response: InvitationResponse | null;
  wedding: InvitationWedding;
}

export function RsvpChapter({ token, guest, response, wedding }: Props) {
  const ref = React.useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const reveal = useReveal();
  const progress = useChapterScroll(ref);
  const { y: glowY } = useDepthLayer(progress, "far");

  return (
    <section
      id="rsvp"
      ref={ref}
      className="relative scroll-mt-6 overflow-hidden px-5 pb-20 pt-24 sm:px-8 sm:pb-28 sm:pt-32"
      style={{ backgroundImage: pageParchment }}
    >
      <LanternField />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-8%] h-[70%]"
        style={{
          y: reduceMotion ? 0 : glowY,
          backgroundImage: `${fairytaleAtmosphere.blushGlow}, radial-gradient(ellipse 36% 28% at 50% 18%, rgba(232,212,168,0.22), transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-xl text-center">
        <motion.div {...reveal(0)} className="flex justify-center">
          <Fleuron className="w-24 text-[#C9A66B]" />
        </motion.div>
        <motion.p {...reveal(0.08)} className={cn(smallCaps, "mt-6 text-[#B76E79]")}>
          Kindly respond
        </motion.p>
        <motion.div {...reveal(0.16)} className="mt-6">
          <GoldDivider />
        </motion.div>
        <motion.p
          {...reveal(0.28, 22)}
          className={cn(displayFont, "mt-10 text-balance text-2xl leading-relaxed text-[#4a3236] sm:text-[2rem]")}
        >
          Dear <span className="italic text-[#B76E79]">{guest.name}</span>, we would be honored by your presence.
          Please let us know if you can join us.
        </motion.p>

        <motion.div className="relative mt-14 text-left">
          <motion.div
            {...reveal(0.42, 24)}
            className="relative border-y border-[#DDBF8D]/45 bg-[#FFFDF8]/40 px-5 py-10 sm:px-8 sm:py-12"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E8D4A8]/80 to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E8D4A8]/80 to-transparent"
            />
            <RsvpForm
              token={token}
              guestName={guest.name}
              plusOneAllowed={guest.plusOneAllowed}
              initialStatus={guest.rsvpStatus}
              initialResponse={response}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.footer
        {...reveal(0.2, 16)}
        className="relative mx-auto mt-24 flex max-w-xl flex-col items-center gap-3 text-center sm:mt-28"
      >
        <span aria-hidden className="mb-2 h-10 w-px bg-gradient-to-b from-transparent to-[#DDBF8D]/80" />
        <span className={cn(displayFont, "text-3xl font-light text-[#C9A66B]")}>{wedding.monogram}</span>
        <p className={cn(smallCaps, "text-[#9b7b62]")}>
          {wedding.coupleNames}
          {wedding.dateLabel ? ` · ${wedding.dateLabel}` : ""}
        </p>
      </motion.footer>
    </section>
  );
}
