"use client";

import * as React from "react";

import {
  detectCapabilities,
  initialQualityFor,
} from "@/features/invitations/components/fairytale/animation-quality/detect-capabilities";
import { FpsMonitor } from "@/features/invitations/components/fairytale/animation-quality/fps-monitor";
import { QualityPolicy } from "@/features/invitations/components/fairytale/animation-quality/quality-policy";
import {
  LANTERN_PERF_PROFILES,
  isAnimationQuality,
  isQualityAbove,
  type AnimationQuality,
  type LanternPerfProfile,
} from "./profiles";

export interface LanternPerfState {
  ready: boolean;
  quality: AnimationQuality;
  profile: LanternPerfProfile;
  reduceMotion: boolean;
  compact: boolean;
}

const fallbackState: LanternPerfState = {
  ready: true,
  quality: "high",
  profile: LANTERN_PERF_PROFILES.high,
  reduceMotion: false,
  compact: false,
};

const LanternPerfContext = React.createContext<LanternPerfState>(fallbackState);

const STORAGE_KEY = "lantern-animation-quality";
const COMPACT_QUERY = "(max-width: 639px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface StoredQuality {
  quality: AnimationQuality;
  ceiling: AnimationQuality;
}

function readStored(): StoredQuality | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { quality, ceiling } = parsed as Record<string, unknown>;
    return isAnimationQuality(quality) && isAnimationQuality(ceiling)
      ? { quality, ceiling }
      : null;
  } catch {
    return null;
  }
}

function writeStored(value: StoredQuality) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

function lighter(a: AnimationQuality, b: AnimationQuality) {
  return isQualityAbove(a, b) ? b : a;
}

function readForcedQuality(): AnimationQuality | null {
  if (process.env.NODE_ENV === "production") return null;
  const value = new URLSearchParams(window.location.search).get("quality");
  return isAnimationQuality(value) ? value : null;
}

/**
 * Phones keep the full effect vocabulary at "balanced" by default.
 * High (Lenis + densest + star glow) stays desktop-oriented.
 */
function lanternInitial(
  detected: { quality: AnimationQuality; ceiling: AnimationQuality },
  compact: boolean,
): { quality: AnimationQuality; ceiling: AnimationQuality } {
  if (!compact) return detected;
  if (detected.quality === "high") {
    return { quality: "balanced", ceiling: "balanced" };
  }
  if (detected.quality === "balanced") {
    return { quality: "balanced", ceiling: "balanced" };
  }
  return detected;
}

interface Props {
  children: React.ReactNode;
  /** While true, quality is never raised (opening sequence playing). */
  transitionActive?: boolean;
}

export function LanternPerfProvider({ children, transitionActive = false }: Props) {
  const [state, setState] = React.useState<LanternPerfState>({
    ready: false,
    quality: "high",
    profile: LANTERN_PERF_PROFILES.high,
    reduceMotion: false,
    compact: false,
  });
  const transitionRef = React.useRef(transitionActive);

  React.useEffect(() => {
    transitionRef.current = transitionActive;
  }, [transitionActive]);

  React.useLayoutEffect(() => {
    const capabilities = detectCapabilities();
    const detected = lanternInitial(
      initialQualityFor(capabilities),
      window.matchMedia(COMPACT_QUERY).matches,
    );
    const stored = readStored();
    const forced = readForcedQuality();

    const initial =
      forced ?? (stored ? lighter(detected.quality, stored.quality) : detected.quality);
    const ceiling =
      forced ?? (stored ? lighter(detected.ceiling, stored.ceiling) : detected.ceiling);

    const compactMq = window.matchMedia(COMPACT_QUERY);
    const motionMq = window.matchMedia(REDUCED_MOTION_QUERY);
    let quality = initial;

    const publish = () => {
      const reduceMotion = motionMq.matches;
      const effective = reduceMotion ? "low" : quality;
      setState((previous) => {
        const next: LanternPerfState = {
          ready: true,
          quality: effective,
          profile: LANTERN_PERF_PROFILES[effective],
          reduceMotion,
          compact: compactMq.matches,
        };
        const unchanged =
          previous.ready &&
          previous.quality === next.quality &&
          previous.reduceMotion === next.reduceMotion &&
          previous.compact === next.compact;
        return unchanged ? previous : next;
      });
    };
    publish();

    const monitor = new FpsMonitor();
    const policy = new QualityPolicy(initial, ceiling);

    const unsubscribe = monitor.subscribe((sample) => {
      if (motionMq.matches || forced) return;
      const change = policy.evaluate(sample, performance.now(), transitionRef.current);
      if (!change) return;
      quality = change.quality;
      writeStored({ quality: policy.quality, ceiling: policy.ceiling });
      publish();
    });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") policy.resetStreaks();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    compactMq.addEventListener("change", publish);
    motionMq.addEventListener("change", publish);
    monitor.start();

    return () => {
      unsubscribe();
      monitor.stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      compactMq.removeEventListener("change", publish);
      motionMq.removeEventListener("change", publish);
    };
  }, []);

  React.useEffect(() => {
    if (!state.ready) return;
    document.documentElement.dataset.lanternPerf = state.quality;
    return () => {
      delete document.documentElement.dataset.lanternPerf;
    };
  }, [state.ready, state.quality]);

  return (
    <LanternPerfContext.Provider value={state}>{children}</LanternPerfContext.Provider>
  );
}

export function useLanternPerf(): LanternPerfState {
  return React.useContext(LanternPerfContext);
}

const MainEffectsContext = React.createContext(true);

/** Main invite sections only animate once revealed (gate/opening stay outside). */
export function MainEffectsProvider({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <MainEffectsContext.Provider value={active}>{children}</MainEffectsContext.Provider>
  );
}

export function useMainEffectsActive() {
  return React.useContext(MainEffectsContext);
}
