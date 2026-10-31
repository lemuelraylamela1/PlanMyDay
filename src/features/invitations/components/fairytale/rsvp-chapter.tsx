"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import {
  useChapterScroll,
  useDepthLayer,
} from "@/features/invitations/components/fairytale/use-cinematic-parallax";
import {
  Fleuron,
  GoldCorner,
  GoldDivider,
  displayFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { LanternField } from "@/features/invitations/components/fairytale/lanterns";
import { SceneTransition } from "@/features/invitations/components/fairytale/scene-transition";
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
      data-scene="rsvp"
      className="relative scroll-mt-6 overflow-hidden px-5 pb-20 pt-24 sm:px-8 sm:pb-28 sm:pt-32"
      style={{ backgroundImage: pageParchment }}
    >
      <SceneTransition tone="dawn" />
      <LanternField />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-8%] h-[70%]"
        style={{
          y: reduceMotion ? 0 : glowY,
          backgroundImage: `${fairytaleAtmosphere.blushGlow}, radial-gradient(ellipse 36% 28% at 50% 18%, rgba(232,212,168,0.22), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 30% at 50% 100%, rgba(221,191,141,0.12), transparent 70%)",
        }}
      />

      <div data-scene-content className="relative mx-auto max-w-xl text-center">
        <motion.div {...reveal(0)} className="flex justify-center">
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -3, 0], opacity: [0.88, 1, 0.88] }}
            transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Fleuron className="w-24 text-[#C9A66B]" />
          </motion.div>
        </motion.div>
        <motion.p {...reveal(0.08)} className={cn(smallCaps, "mt-6 text-[#B76E79]")}>
          Kindly respond
        </motion.p>
        <motion.h2
          {...reveal(0.14, 18)}
          className={cn(displayFont, "mt-5 text-3xl font-light tracking-[-0.02em] text-[#4a3236] sm:text-4xl")}
        >
          The RSVP chamber
        </motion.h2>
        <motion.div {...reveal(0.2)} className="mt-6">
          <GoldDivider />
        </motion.div>
        <motion.p
          {...reveal(0.28, 22)}
          className={cn(displayFont, "mt-10 text-balance text-2xl leading-relaxed text-[#4a3236] sm:text-[2rem]")}
        >
          Dear <span className="italic text-[#B76E79]">{guest.name}</span>, we would be honored by your presence.
          Please let us know if you can join us.
        </motion.p>

        <motion.div
          className="relative mt-14 text-left"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease: fairytaleEase, delay: 0.1 }}
        >
          <div className="relative bg-[#FFFDF8]/55 px-5 py-11 shadow-[0_28px_80px_-48px_rgba(74,50,54,0.45)] sm:px-9 sm:py-14">
            <GoldCorner className="left-1.5 top-1.5 opacity-80 sm:left-2 sm:top-2" />
            <GoldCorner className="right-1.5 top-1.5 rotate-90 opacity-80 sm:right-2 sm:top-2" />
            <GoldCorner className="bottom-1.5 left-1.5 -rotate-90 opacity-80 sm:bottom-2 sm:left-2" />
            <GoldCorner className="bottom-1.5 right-1.5 rotate-180 opacity-80 sm:bottom-2 sm:right-2" />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#E8D4A8]/85 to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E8D4A8]/85 to-transparent"
            />
            <RsvpForm
              token={token}
              guestName={guest.name}
              monogram={wedding.monogram}
              plusOneAllowed={guest.plusOneAllowed}
              initialStatus={guest.rsvpStatus}
              initialResponse={response}
            />
          </div>
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
