"use client";

import * as React from "react";

export type ExperiencePhase = "invitation" | "opening" | "revealed";

type ExperienceContextValue = {
  phase: ExperiencePhase;
  /** Invitation -> opening sequence. Also enables/starts music. */
  open: () => void;
  /** Opening sequence -> revealed site. */
  reveal: () => void;
  guestName: string;
  invitationToken: string | null;
  reducedMotion: boolean;
  /** True once the guest has opened the invitation (music allowed to play). */
  musicEnabled: boolean;
  muted: boolean;
  toggleMuted: () => void;
};

const ExperienceContext = React.createContext<ExperienceContextValue | null>(null);

const MUTE_KEY = "lantern-music-muted";

export function ExperienceProvider({
  children,
  token,
  guestName: guestNameProp,
}: {
  children: React.ReactNode;
  token?: string | null;
  guestName?: string | null;
}) {
  const [phase, setPhase] = React.useState<ExperiencePhase>("invitation");
  const [guestName, setGuestName] = React.useState<string>(
    guestNameProp ? `Dear ${guestNameProp}` : "Dear Guest"
  );
  const [invitationToken] = React.useState<string | null>(token ?? null);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [musicEnabled, setMusicEnabled] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  // Update guestName if prop changes
  React.useEffect(() => {
    if (guestNameProp) {
      setGuestName(`Dear ${guestNameProp}`);
    }
  }, [guestNameProp]);

  // Reduced-motion preference (live).
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const id = window.setTimeout(() => setReducedMotion(mq.matches), 0);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => {
      window.clearTimeout(id);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  // Restore saved mute preference.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = window.localStorage.getItem(MUTE_KEY);
      if (saved !== null) setMuted(saved === "true");
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Lock scroll until the site is revealed.
  React.useEffect(() => {
    const locked = phase !== "revealed";
    document.body.classList.toggle("experience-locked", locked);
    return () => document.body.classList.remove("experience-locked");
  }, [phase]);

  const open = React.useCallback(() => {
    setMusicEnabled(true);
    setPhase((p) => (p === "invitation" ? "opening" : p));
  }, []);

  const reveal = React.useCallback(() => {
    setPhase("revealed");
  }, []);

  const toggleMuted = React.useCallback(() => {
    setMuted((m) => {
      const next = !m;
      window.localStorage.setItem(MUTE_KEY, String(next));
      return next;
    });
  }, []);

  const value = React.useMemo<ExperienceContextValue>(
    () => ({
      phase,
      open,
      reveal,
      guestName,
      invitationToken,
      reducedMotion,
      musicEnabled,
      muted,
      toggleMuted,
    }),
    [phase, open, reveal, guestName, invitationToken, reducedMotion, musicEnabled, muted, toggleMuted]
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const ctx = React.useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience must be used within an ExperienceProvider");
  }
  return ctx;
}
