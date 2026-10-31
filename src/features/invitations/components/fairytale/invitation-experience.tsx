"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

import {
  InvitationAudioProvider,
  useInvitationAudio,
} from "@/features/invitations/components/fairytale/invitation-audio";
import { RoyalEnvelope } from "@/features/invitations/components/fairytale/royal-envelope";
import { HeroChapter } from "@/features/invitations/components/fairytale/hero-chapter";
import { InvitationChapter } from "@/features/invitations/components/fairytale/invitation-chapter";
import { useChapterScrollTrigger } from "@/features/invitations/components/fairytale/use-chapter-scroll-trigger";
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

type Phase = "sealed" | "opening" | "revealing" | "revealed";

function InvitationExperienceInner({ token, guest, response, wedding }: Props) {
  const [phase, setPhase] = React.useState<Phase>("sealed");
  const [loadRest, setLoadRest] = React.useState(false);
  const storyRef = React.useRef<HTMLElement>(null);
  const audio = useInvitationAudio();
  const opened = phase === "revealed";
  const storyMounted = phase !== "sealed";

  useChapterScrollTrigger(storyRef, {
    enabled: opened,
    chapterVersion: loadRest ? 1 : 0,
  });

  const handleOpenStart = React.useCallback(() => {
    // Unlock + start the magical bed on the same gesture as Open Invitation.
    void audio?.unlock().then(() => audio?.startTransition());
    window.scrollTo({ top: 0 });
    setPhase("opening");
  }, [audio]);

  const handleSealBreak = React.useCallback(() => {
    // Ensure magical bed is running even if unlock was slow.
    void audio?.startTransition();
  }, [audio]);

  const handleRevealStart = React.useCallback(() => {
    setPhase("revealing");
    // Tangled theme begins as the website itself appears.
    void audio?.start();
  }, [audio]);

  const handleOpened = React.useCallback(() => {
    setPhase("revealed");
    window.scrollTo({ top: 0 });
  }, []);

  const transitioning = phase === "opening" || phase === "revealing";

  React.useEffect(() => {
    if (!transitioning) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [transitioning]);

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
      <main
        ref={storyRef}
        className="relative min-h-[100svh] overflow-x-clip bg-[#22243A] text-[#4a3236]"
      >
        {storyMounted && (
          <div key="story" className="bg-[#FFFDF8]" inert={!opened} aria-hidden={!opened}>
            <HeroChapter wedding={wedding} entered={phase === "revealing" || opened} />
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
          </div>
        )}

        {!opened && (
          <div key="envelope" className="fixed inset-0 z-30 overflow-hidden">
            <RoyalEnvelope
              guestName={guest.name}
              coupleNames={wedding.coupleNames}
              monogram={wedding.monogram}
              dateLabel={wedding.dateLabel}
              onOpenStart={handleOpenStart}
              onSealBreak={handleSealBreak}
              onRevealStart={handleRevealStart}
              onOpened={handleOpened}
            />
          </div>
        )}
      </main>
    </MotionConfig>
  );
}
