export type AnimationQuality = "high" | "balanced" | "low";

/** Ordered from richest to lightest — index math drives one-step up/downgrades. */
export const QUALITY_ORDER: readonly AnimationQuality[] = ["high", "balanced", "low"];

export interface QualityProfile {
  /** Golden stars that bloom out of the invitation card. */
  introStars: number;
  /** Gold dust bursts at the seal break and website reveal. */
  dust: number;
  /** Distant lanterns floating over the castle backdrop. */
  introLanterns: number;
  /** Idle twinkle / drift loops on the sealed scroll before it opens. */
  idleLoops: boolean;
  /** Multi-layer glow shadows on lanterns and dust. */
  richGlow: boolean;
  /** Blurred shadows and the frosted Open button. */
  blurEffects: boolean;
  /** Drifting motes in night scenes. */
  sceneParticles: number;
  /** Rising sky lanterns per chapter. */
  lanternField: number;
  /** Flame flicker + glow breathing inside each sky lantern. */
  lanternFlicker: "full" | "soft" | "none";
  /** Multiplier for scroll parallax and ScrollTrigger depth (0 = static). */
  parallax: number;
  celebrationLanterns: number;
  celebrationParticles: number;
}

export const QUALITY_PROFILES: Record<AnimationQuality, QualityProfile> = {
  high: {
    introStars: 48,
    dust: 36,
    introLanterns: 18,
    idleLoops: true,
    richGlow: true,
    blurEffects: true,
    sceneParticles: 6,
    lanternField: 4,
    lanternFlicker: "full",
    parallax: 1,
    celebrationLanterns: 12,
    celebrationParticles: 22,
  },
  balanced: {
    introStars: 28,
    dust: 18,
    introLanterns: 10,
    idleLoops: true,
    richGlow: false,
    blurEffects: false,
    sceneParticles: 3,
    lanternField: 2,
    lanternFlicker: "soft",
    parallax: 0.5,
    celebrationLanterns: 7,
    celebrationParticles: 10,
  },
  low: {
    introStars: 12,
    dust: 6,
    introLanterns: 6,
    idleLoops: false,
    richGlow: false,
    blurEffects: false,
    sceneParticles: 0,
    lanternField: 2,
    lanternFlicker: "none",
    parallax: 0,
    celebrationLanterns: 4,
    celebrationParticles: 0,
  },
};

/**
 * Small screens show fewer decorative elements so they don't look crowded.
 * This is visual density only — performance is decided by the quality tier.
 */
export function densityCount(count: number, compact: boolean, minimum = 0) {
  if (!compact || count === 0) return count;
  return Math.max(minimum, Math.round(count * 0.5));
}

export function lowerQuality(quality: AnimationQuality): AnimationQuality {
  const index = QUALITY_ORDER.indexOf(quality);
  return QUALITY_ORDER[Math.min(index + 1, QUALITY_ORDER.length - 1)] ?? quality;
}

export function raiseQuality(quality: AnimationQuality): AnimationQuality {
  const index = QUALITY_ORDER.indexOf(quality);
  return QUALITY_ORDER[Math.max(index - 1, 0)] ?? quality;
}

export function isQualityAbove(a: AnimationQuality, b: AnimationQuality) {
  return QUALITY_ORDER.indexOf(a) < QUALITY_ORDER.indexOf(b);
}

export function isAnimationQuality(value: unknown): value is AnimationQuality {
  return value === "high" || value === "balanced" || value === "low";
}
