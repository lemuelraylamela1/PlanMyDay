import {
  isQualityAbove,
  lowerQuality,
  raiseQuality,
  type AnimationQuality,
} from "@/features/invitations/components/fairytale/animation-quality/quality-profiles";
import type { FpsSample } from "@/features/invitations/components/fairytale/animation-quality/fps-monitor";

/** Below this FPS a tier is struggling. Low has no floor — it is the lightest variant. */
const FLOOR_FPS: Record<AnimationQuality, number> = { high: 48, balanced: 33, low: 0 };
/** Consecutive 1s windows below the floor before stepping down. */
const DOWNGRADE_WINDOWS = 3;
/** FPS that must be held continuously before stepping up. */
const UPGRADE_FPS = 55;
const UPGRADE_HOLD_MS = 20_000;
/** Minimum time between any two tier changes. */
const COOLDOWN_MS = 8_000;

export type QualityChange =
  | { direction: "down"; quality: AnimationQuality; fps: number }
  | { direction: "up"; quality: AnimationQuality; fps: number };

/**
 * Decides tier changes from rolling FPS windows.
 *
 * - One dropped frame never matters: it takes several slow windows in a row.
 * - After a downgrade the failed tier becomes off-limits, so the quality can
 *   never bounce back and forth.
 * - Upgrades only happen when the initial hardware guess was conservative,
 *   and never while a cinematic transition is playing.
 */
export class QualityPolicy {
  quality: AnimationQuality;
  ceiling: AnimationQuality;
  downgrades = 0;
  upgrades = 0;

  private slowWindows = 0;
  private fastSince: number | null = null;
  private lastChangeAt = Number.NEGATIVE_INFINITY;

  constructor(quality: AnimationQuality, ceiling: AnimationQuality) {
    this.quality = quality;
    this.ceiling = isQualityAbove(quality, ceiling) ? quality : ceiling;
  }

  /** Call after a pause (hidden tab) so stale streaks don't carry over. */
  resetStreaks() {
    this.slowWindows = 0;
    this.fastSince = null;
  }

  evaluate(sample: FpsSample, now: number, transitionActive: boolean): QualityChange | null {
    const floor = FLOOR_FPS[this.quality];
    this.slowWindows = sample.fps < floor ? this.slowWindows + 1 : 0;

    if (sample.fps >= UPGRADE_FPS) this.fastSince ??= now;
    else this.fastSince = null;

    if (now - this.lastChangeAt < COOLDOWN_MS) return null;

    if (this.slowWindows >= DOWNGRADE_WINDOWS && this.quality !== "low") {
      this.quality = lowerQuality(this.quality);
      this.ceiling = this.quality;
      this.downgrades += 1;
      this.markChanged(now);
      return { direction: "down", quality: this.quality, fps: sample.average };
    }

    const canUpgrade =
      !transitionActive &&
      isQualityAbove(this.ceiling, this.quality) &&
      this.fastSince !== null &&
      now - this.fastSince >= UPGRADE_HOLD_MS;
    if (canUpgrade) {
      this.quality = raiseQuality(this.quality);
      this.upgrades += 1;
      this.markChanged(now);
      return { direction: "up", quality: this.quality, fps: sample.average };
    }

    return null;
  }

  private markChanged(now: number) {
    this.lastChangeAt = now;
    this.resetStreaks();
  }
}
