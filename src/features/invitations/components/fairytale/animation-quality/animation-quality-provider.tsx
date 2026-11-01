"use client";

import * as React from "react";

import {
  detectCapabilities,
  initialQualityFor,
  type DeviceCapabilities,
} from "@/features/invitations/components/fairytale/animation-quality/detect-capabilities";
import { FpsMonitor } from "@/features/invitations/components/fairytale/animation-quality/fps-monitor";
import { QualityPolicy } from "@/features/invitations/components/fairytale/animation-quality/quality-policy";
import {
  QUALITY_PROFILES,
  isAnimationQuality,
  isQualityAbove,
  type AnimationQuality,
  type QualityProfile,
} from "@/features/invitations/components/fairytale/animation-quality/quality-profiles";

export interface AnimationQualityState {
  /** False until the client has measured the device (always false during SSR). */
  ready: boolean;
  quality: AnimationQuality;
  profile: QualityProfile;
  reduceMotion: boolean;
  /** Small viewport — fewer decorative elements for visual density only. */
  compact: boolean;
}

export interface AnimationQualityDiagnostics {
  monitor: FpsMonitor | null;
  capabilities: DeviceCapabilities | null;
  initialQuality: AnimationQuality | null;
  ceiling: AnimationQuality | null;
  downgrades: number;
  upgrades: number;
  transitionActive: boolean;
  forced: boolean;
}

const fallbackState: AnimationQualityState = {
  ready: true,
  quality: "high",
  profile: QUALITY_PROFILES.high,
  reduceMotion: false,
  compact: false,
};

const AnimationQualityContext = React.createContext<AnimationQualityState>(fallbackState);
const DiagnosticsContext = React.createContext<React.RefObject<AnimationQualityDiagnostics> | null>(
  null,
);

const STORAGE_KEY = "invite-animation-quality";
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
    return isAnimationQuality(quality) && isAnimationQuality(ceiling) ? { quality, ceiling } : null;
  } catch {
    return null;
  }
}

function writeStored(value: StoredQuality) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage can be disabled (private mode); quality simply isn't remembered */
  }
}

function lighter(a: AnimationQuality, b: AnimationQuality) {
  return isQualityAbove(a, b) ? b : a;
}

/** Development-only `?quality=high|balanced|low` override for testing tiers. */
function readForcedQuality(): AnimationQuality | null {
  if (process.env.NODE_ENV === "production") return null;
  const value = new URLSearchParams(window.location.search).get("quality");
  return isAnimationQuality(value) ? value : null;
}

interface Props {
  children: React.ReactNode;
  /** While true, quality is never raised (the cinematic sequence is playing). */
  transitionActive?: boolean;
}

export function AnimationQualityProvider({ children, transitionActive = false }: Props) {
  // Identical on server and first client render, so hydration never mismatches.
  const [state, setState] = React.useState<AnimationQualityState>({
    ready: false,
    quality: "high",
    profile: QUALITY_PROFILES.high,
    reduceMotion: false,
    compact: false,
  });
  const diagnostics = React.useRef<AnimationQualityDiagnostics>({
    monitor: null,
    capabilities: null,
    initialQuality: null,
    ceiling: null,
    downgrades: 0,
    upgrades: 0,
    transitionActive,
    forced: false,
  });
  const transitionRef = React.useRef(transitionActive);

  React.useEffect(() => {
    transitionRef.current = transitionActive;
    diagnostics.current.transitionActive = transitionActive;
  }, [transitionActive]);

  // Runs before the first paint, so the intro is built once with the right variant.
  React.useLayoutEffect(() => {
    const diag = diagnostics.current;
    const capabilities = detectCapabilities();
    const detected = initialQualityFor(capabilities);
    const stored = readStored();
    const forced = readForcedQuality();

    const initial = forced ?? (stored ? lighter(detected.quality, stored.quality) : detected.quality);
    const ceiling = forced ?? (stored ? lighter(detected.ceiling, stored.ceiling) : detected.ceiling);

    Object.assign(diag, {
      capabilities,
      initialQuality: initial,
      ceiling,
      forced: forced !== null,
    });

    const compactMq = window.matchMedia(COMPACT_QUERY);
    const motionMq = window.matchMedia(REDUCED_MOTION_QUERY);
    let quality = initial;

    const publish = () => {
      const reduceMotion = motionMq.matches;
      const effective = reduceMotion ? "low" : quality;
      setState((previous) => {
        const next: AnimationQualityState = {
          ready: true,
          quality: effective,
          profile: QUALITY_PROFILES[effective],
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
    diag.monitor = monitor;

    const unsubscribe = monitor.subscribe((sample) => {
      // Reduced motion is already the lightest variant; forced tiers are for testing.
      if (motionMq.matches || forced) return;
      const change = policy.evaluate(sample, performance.now(), transitionRef.current);
      if (!change) return;
      quality = change.quality;
      diag.ceiling = policy.ceiling;
      diag.downgrades = policy.downgrades;
      diag.upgrades = policy.upgrades;
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
      diag.monitor = null;
      document.removeEventListener("visibilitychange", handleVisibility);
      compactMq.removeEventListener("change", publish);
      motionMq.removeEventListener("change", publish);
    };
  }, []);

  return (
    <DiagnosticsContext.Provider value={diagnostics}>
      <AnimationQualityContext.Provider value={state}>{children}</AnimationQualityContext.Provider>
    </DiagnosticsContext.Provider>
  );
}

/**
 * Current animation tier and its budgets. Outside the provider it returns the
 * full-quality profile, so components keep working wherever they are reused.
 */
export function useAnimationQuality(): AnimationQualityState {
  return React.useContext(AnimationQualityContext);
}

export function useAnimationQualityDiagnostics() {
  return React.useContext(DiagnosticsContext);
}
