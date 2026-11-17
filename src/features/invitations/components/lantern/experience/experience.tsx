"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ExperienceProvider, useExperience } from "./experience-provider";
import { InvitationGate } from "./invitation-gate";
import { MusicPlayer } from "./music-player";
import { BackToTop } from "../ui/back-to-top";
import {
  LanternPerfProvider,
  MainEffectsProvider,
} from "../performance/lantern-perf-provider";
import { useInviteViewport } from "../hooks/use-is-mobile";

function OpeningFallback() {
  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[110]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background:
          "linear-gradient(180deg, #070314 0%, #0d0720 38%, #1e0f3a 70%, #39205f 100%)",
      }}
    />
  );
}

const OpeningSequence = dynamic(
  () => import("./opening-sequence").then((m) => m.OpeningSequence),
  {
    ssr: false,
    loading: () => <OpeningFallback />,
  },
);
const SmoothScroll = dynamic(
  () => import("./smooth-scroll").then((m) => m.SmoothScroll),
  { ssr: false },
);

function ExperienceShell({ children }: { children: React.ReactNode }) {
  const { phase } = useExperience();
  const { width, height, isMobile, isCompact, isShort } = useInviteViewport();
  const revealed = phase === "revealed";
  const transitionActive = phase === "opening";
  // Paint the hero while the opening overlay still covers it, so the
  // handoff is only an overlay fade — not a first paint of the whole page.
  const [primed, setPrimed] = React.useState(false);
  React.useEffect(() => {
    if (phase === "invitation") {
      setPrimed(false);
      return;
    }
    if (phase === "revealed") {
      setPrimed(true);
      return;
    }
    const id = window.setTimeout(() => setPrimed(true), 2200);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Warm the opening-sequence chunk in the background while the guest
  // is still on the invitation gate.
  React.useEffect(() => {
    if (phase === "invitation") {
      void import("./opening-sequence");
    }
  }, [phase]);

  // Broadcast live phone screen metrics so section CSS can keep alignment intact.
  React.useEffect(() => {
    const root = document.querySelector(".invite-root") as HTMLElement | null;
    if (!root) return;
    const vvW = width || window.innerWidth;
    const vvH = height || window.innerHeight;
    root.style.setProperty("--invite-vvw", `${vvW}px`);
    root.style.setProperty("--invite-vvh", `${vvH}px`);
    root.dataset.inviteMobile = isMobile ? "true" : "false";
    root.dataset.inviteCompact = isCompact ? "true" : "false";
    root.dataset.inviteShort = isShort ? "true" : "false";
  }, [width, height, isMobile, isCompact, isShort]);

  return (
    <LanternPerfProvider transitionActive={transitionActive}>
      <MusicPlayer />
      <BackToTop />
      <SmoothScroll />

      {/* Full site stays in the DOM for SEO; effects pause until revealed. */}
      <MainEffectsProvider active={revealed}>
        <div
          aria-hidden={!revealed}
          className={
            primed
              ? revealed
                ? "opacity-100"
                : "pointer-events-none select-none opacity-100"
              : "pointer-events-none select-none opacity-0"
          }
        >
          {children}
        </div>
      </MainEffectsProvider>

      <AnimatePresence mode="sync">
        {phase === "invitation" && <InvitationGate key="gate" />}
        {phase === "opening" && <OpeningSequence key="sequence" />}
      </AnimatePresence>
    </LanternPerfProvider>
  );
}

export function Experience({
  children,
  token,
  guestName,
  initialRsvpOpen = false,
}: {
  children: React.ReactNode;
  token?: string | null;
  guestName?: string | null;
  initialRsvpOpen?: boolean;
}) {
  return (
    <ExperienceProvider
      token={token}
      guestName={guestName}
      initialRsvpOpen={initialRsvpOpen}
    >
      <ExperienceShell>{children}</ExperienceShell>
    </ExperienceProvider>
  );
}
