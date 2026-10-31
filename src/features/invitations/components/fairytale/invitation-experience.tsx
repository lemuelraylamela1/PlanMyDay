"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

import { fairytaleEase } from "@/features/invitations/components/fairytale/use-reveal";
import {
  InvitationAudioProvider,
  useInvitationAudio,
} from "@/features/invitations/components/fairytale/invitation-audio";
import { RoyalEnvelope } from "@/features/invitations/components/fairytale/royal-envelope";
import { HeroChapter } from "@/features/invitations/components/fairytale/hero-chapter";
import { InvitationChapter } from "@/features/invitations/components/fairytale/invitation-chapter";
import type {
  InvitationGuest,
  InvitationResponse,
  InvitationWedding,
} from "@/features/invitations/components/fairytale/types";

const VideoChapter = React.lazy(() =>
  import("@/features/invitations/components/fairytale/video-chapter").then((m) => ({
    default: m.VideoChapter,
  })),
);
const GalleryChapter = React.lazy(() =>
  import("@/features/invitations/components/fairytale/gallery-chapter").then((m) => ({
    default: m.GalleryChapter,
  })),
);
const CountdownChapter = React.lazy(() =>
  import("@/features/invitations/components/fairytale/countdown-chapter").then((m) => ({
    default: m.CountdownChapter,
  })),
);
const InterludeChapter = React.lazy(() =>
  import("@/features/invitations/components/fairytale/interlude-chapter").then((m) => ({
    default: m.InterludeChapter,
  })),
);
const RsvpChapter = React.lazy(() =>
  import("@/features/invitations/components/fairytale/rsvp-chapter").then((m) => ({
    default: m.RsvpChapter,
  })),
);

interface Props {
  token: string;
  guest: InvitationGuest;
  response: InvitationResponse | null;
  wedding: InvitationWedding;
}

export function InvitationExperience(props: Props) {
  return (
    <InvitationAudioProvider>
      <InvitationExperienceInner {...props} />
    </InvitationAudioProvider>
  );
}

function InvitationExperienceInner({ token, guest, response, wedding }: Props) {
  const [opened, setOpened] = React.useState(false);
  const [loadRest, setLoadRest] = React.useState(false);
  const audio = useInvitationAudio();

  const handleOpenStart = React.useCallback(() => {
    // Unlock autoplay on the open click; music begins when the hero story appears.
    void audio?.unlock();
  }, [audio]);

  const handleOpened = React.useCallback(() => {
    setOpened(true);
    window.scrollTo({ top: 0 });
    void audio?.start();
  }, [audio]);

  React.useEffect(() => {
    if (!opened) return;
    let cancelled = false;
    const revealRest = () => {
      if (!cancelled) setLoadRest(true);
    };

    let idleId: number | null = null;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(revealRest, { timeout: 900 });
    }
    const fallback = window.setTimeout(revealRest, 400);

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      window.clearTimeout(fallback);
    };
  }, [opened]);

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-[100svh] overflow-x-clip bg-[#22243A] text-[#4a3236]">
        {opened && (
          <motion.div
            key="story"
            className="bg-[#FFFDF8]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, ease: fairytaleEase }}
          >
            <HeroChapter wedding={wedding} />
            <InvitationChapter wedding={wedding} />
            {loadRest && (
              <React.Suspense fallback={null}>
                <VideoChapter />
                <GalleryChapter />
                <CountdownChapter wedding={wedding} />
                <InterludeChapter story={wedding.story} />
                <RsvpChapter token={token} guest={guest} response={response} wedding={wedding} />
              </React.Suspense>
            )}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {!opened && (
            <motion.div
              key="envelope"
              className="fixed inset-0 z-30 overflow-hidden bg-[#22243A]"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: fairytaleEase }}
            >
              <RoyalEnvelope
                guestName={guest.name}
                coupleNames={wedding.coupleNames}
                monogram={wedding.monogram}
                dateLabel={wedding.dateLabel}
                onOpenStart={handleOpenStart}
                onOpened={handleOpened}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
