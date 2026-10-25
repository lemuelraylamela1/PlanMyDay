"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { GoldDivider, displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
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
  const reveal = useReveal();

  return (
    <section
      id="rsvp"
      className="relative px-6 pb-16 pt-28 sm:pt-36"
      style={{ backgroundImage: pageParchment }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(ellipse 60% 35% at 50% 18%, rgba(247,227,232,0.7), transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-xl text-center">
        <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#B76E79]")}>
          Kindly respond
        </motion.p>
        <motion.div {...reveal(0.1)} className="mt-6">
          <GoldDivider />
        </motion.div>
        <motion.p
          {...reveal(0.25, 28)}
          className={cn(displayFont, "mt-10 text-balance text-2xl leading-relaxed text-[#4a3236] sm:text-3xl")}
        >
          Dear <span className="italic text-[#B76E79]">{guest.name}</span>, we would be honored by your presence.
          Please let us know if you can join us.
        </motion.p>

        <motion.div {...reveal(0.45)} className="mt-14 text-left">
          <RsvpForm
            token={token}
            guestName={guest.name}
            plusOneAllowed={guest.plusOneAllowed}
            initialStatus={guest.rsvpStatus}
            initialResponse={response}
          />
        </motion.div>
      </div>

      <footer className="relative mx-auto mt-32 flex max-w-xl flex-col items-center gap-3 text-center">
        <span className={cn(displayFont, "text-3xl font-light text-[#C9A66B]")}>{wedding.monogram}</span>
        <p className={cn(smallCaps, "text-[#9b7b62]")}>
          {wedding.coupleNames}
          {wedding.dateLabel ? ` · ${wedding.dateLabel}` : ""}
        </p>
      </footer>
    </section>
  );
}
