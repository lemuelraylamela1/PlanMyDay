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
  // Paint the page while the guest is still reading the gate, so the
  // opening timeline never shares the main thread with a first layout.
  // If they tap before that idle paint, wait until the overlay is gone.
  const [primed, setPrimed] = React.useState(false);
  React.useEffect(() => {
    if (primed || phase === "opening") return;
    if (phase === "revealed") {
      setPrimed(true);
      return;
    }
    let idleId = 0;
    const timeoutId = window.setTimeout(() => setPrimed(true), 1100);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => setPrimed(true), { timeout: 1600 });
    }
    return () => {
      window.clearTimeout(timeoutId);
      if (idleId) window.cancelIdleCallback(idleId);
    };
  }, [phase, primed]);

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

      {/* Mount early for layout, but stay invisible until reveal so the hero
          cannot peek through the opening overlay (which looked like a double pop). */}
      <MainEffectsProvider active={revealed}>
        <div
          aria-hidden={!revealed}
          className={
            primed && revealed
              ? "opacity-100"
              : "pointer-events-none select-none opacity-0"
          }
        >
          {primed ? children : null}
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
