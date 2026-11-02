import type { AnimationQuality } from "@/features/invitations/components/fairytale/animation-quality/quality-profiles";
import {
  densityCount as fairytaleDensityCount,
  isAnimationQuality,
  isQualityAbove,
  lowerQuality,
  raiseQuality,
} from "@/features/invitations/components/fairytale/animation-quality/quality-profiles";

export type { AnimationQuality };
export { isAnimationQuality, isQualityAbove, lowerQuality, raiseQuality };

/** Lantern-specific budgets — preserve effect types; scale cost, don't delete layers. */
export interface LanternPerfProfile {
  /** Multiplier applied to section star counts (then clamped). */
  starScale: number;
  /** Canvas star glow via shadowBlur — expensive on mobile GPUs. */
  starGlow: boolean;
  /** Cap devicePixelRatio for canvases. */
  maxDpr: number;
  dustScale: number;
  lanternScale: number;
  fireflyScale: number;
  /** Opening ParticleField density multiplier. */
  particleDensityScale: number;
  /** Animated water-line reflections. */
  reflectionMotion: boolean;
  /** Scroll-linked blur orb in SceneAtmosphere. */
  atmosphereMotion: boolean;
  /** Heavy animated CSS filters (aurora, foil shimmer). */
  richFilters: boolean;
  /** Scroll parallax strength 0–1. */
  parallax: number;
  /** Lenis smooth scroll (desktop high only). */
  smoothScroll: boolean;
  /** Soften opening stage scale / large blurs. */
  openingStageScale: number;
}

export const LANTERN_PERF_PROFILES: Record<AnimationQuality, LanternPerfProfile> = {
  high: {
    starScale: 1,
    starGlow: true,
    maxDpr: 2,
    dustScale: 1,
    lanternScale: 1,
    fireflyScale: 1,
    particleDensityScale: 1,
    reflectionMotion: true,
    atmosphereMotion: true,
    richFilters: true,
    parallax: 1,
    smoothScroll: true,
    openingStageScale: 1.18,
  },
  balanced: {
    starScale: 0.55,
    starGlow: false,
    maxDpr: 1.5,
    dustScale: 0.6,
    lanternScale: 0.55,
    fireflyScale: 0.6,
    particleDensityScale: 0.45,
    reflectionMotion: true,
    atmosphereMotion: false,
    richFilters: false,
    parallax: 0.45,
    smoothScroll: false,
    openingStageScale: 1,
  },
  low: {
    starScale: 0.28,
    starGlow: false,
    maxDpr: 1,
    dustScale: 0.35,
    lanternScale: 0.35,
    fireflyScale: 0.4,
    particleDensityScale: 0.22,
    reflectionMotion: false,
    atmosphereMotion: false,
    richFilters: false,
    parallax: 0.15,
    smoothScroll: false,
    openingStageScale: 1,
  },
};

/** Scale a decorative count by the profile multiplier; compact screens get an extra density trim. */
export function scaleEffectCount(
  base: number,
  scale: number,
  compact: boolean,
  minimum = 4,
) {
  const scaled = Math.round(base * scale);
  return fairytaleDensityCount(Math.max(minimum, scaled), compact, minimum);
}

export function scaleParticleDensity(base: number, scale: number) {
  return base * scale;
}
