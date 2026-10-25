"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

import { fairytaleEase } from "@/features/invitations/components/fairytale/use-reveal";
import { RoyalEnvelope } from "@/features/invitations/components/fairytale/royal-envelope";
import { InvitationChapter } from "@/features/invitations/components/fairytale/invitation-chapter";
import { HeroChapter } from "@/features/invitations/components/fairytale/hero-chapter";
import { InterludeChapter } from "@/features/invitations/components/fairytale/interlude-chapter";
import { GalleryChapter } from "@/features/invitations/components/fairytale/gallery-chapter";
import { RsvpChapter } from "@/features/invitations/components/fairytale/rsvp-chapter";
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

export function InvitationExperience({ token, guest, response, wedding }: Props) {
  const [opened, setOpened] = React.useState(false);

  const handleOpened = React.useCallback(() => {
    setOpened(true);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-[100svh] overflow-x-clip bg-[#16121a] text-[#4a3236]">
        <AnimatePresence mode="sync" initial={false}>
          {opened ? (
            <motion.div
              key="story"
              className="bg-[#FFFDF8]"
              initial={{ opacity: 0, scale: 1.008, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.25, ease: fairytaleEase }}
            >
              <HeroChapter wedding={wedding} />
              <InvitationChapter wedding={wedding} />
              <InterludeChapter />
              <GalleryChapter />
              <RsvpChapter token={token} guest={guest} response={response} wedding={wedding} />
            </motion.div>
          ) : (
            <motion.div
              key="envelope"
              className="relative z-10"
              exit={{ opacity: 0, scale: 1.025, filter: "blur(9px)" }}
              transition={{ duration: 1.15, ease: fairytaleEase }}
            >
              <RoyalEnvelope
                guestName={guest.name}
                coupleNames={wedding.coupleNames}
                monogram={wedding.monogram}
                dateLabel={wedding.dateLabel}
                onOpened={handleOpened}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
