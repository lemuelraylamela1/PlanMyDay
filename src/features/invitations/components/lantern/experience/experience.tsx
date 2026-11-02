"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { ExperienceProvider, useExperience } from "./experience-provider";
import { InvitationGate } from "./invitation-gate";
import { MusicPlayer } from "./music-player";
import { BackToTop } from "../ui/back-to-top";

function OpeningFallback() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[110]"
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
  const revealed = phase === "revealed";

  // Warm the opening-sequence chunk in the background while the guest
  // is still on the invitation gate.
  React.useEffect(() => {
    if (phase === "invitation") {
      void import("./opening-sequence");
    }
  }, [phase]);

  return (
    <>
      <MusicPlayer />
      <BackToTop />
      <SmoothScroll />

      {/* The full site lives in the DOM for SEO; hidden until revealed. */}
      <div
        aria-hidden={!revealed}
        className={
          revealed
            ? "opacity-100 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            : "pointer-events-none select-none opacity-0"
        }
      >
        {children}
      </div>

      <AnimatePresence>
        {phase === "invitation" && <InvitationGate key="gate" />}
        {phase === "opening" && <OpeningSequence key="sequence" />}
      </AnimatePresence>
    </>
  );
}

export function Experience({
  children,
  token,
  guestName,
}: {
  children: React.ReactNode;
  token?: string | null;
  guestName?: string | null;
}) {
  return (
    <ExperienceProvider token={token} guestName={guestName}>
      <ExperienceShell>{children}</ExperienceShell>
    </ExperienceProvider>
  );
}
