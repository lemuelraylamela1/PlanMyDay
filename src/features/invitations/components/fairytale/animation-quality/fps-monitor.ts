export interface FpsSample {
  /** FPS of the window that just closed. */
  fps: number;
  /** Mean of the retained rolling windows. */
  average: number;
  /** Oldest first. */
  windows: readonly number[];
}

type Listener = (sample: FpsSample) => void;

interface Options {
  windowMs?: number;
  maxWindows?: number;
  /** Frames right after start / tab return are ignored while the page settles. */
  warmupMs?: number;
}

/** A single frame longer than this is treated as a slow frame, not a frozen one. */
const SLOW_FRAME_MS = 250;
/** Longer gaps mean rAF was suspended (backgrounded, debugger, OS freeze). */
const SUSPENDED_FRAME_MS = 1000;

/**
 * Lightweight requestAnimationFrame sampler. It does no React work per frame:
 * deltas are summed into fixed windows and listeners hear about each closed
 * window (about once per second).
 */
export class FpsMonitor {
  private readonly windowMs: number;
  private readonly maxWindows: number;
  private readonly warmupMs: number;
  private readonly listeners = new Set<Listener>();
  private readonly windows: number[] = [];

  private rafId: number | null = null;
  private lastTime: number | null = null;
  private warmupUntil = 0;
  private frames = 0;
  private elapsed = 0;
  private running = false;
  private latestSample: FpsSample | null = null;

  constructor({ windowMs = 1000, maxWindows = 5, warmupMs = 1000 }: Options = {}) {
    this.windowMs = windowMs;
    this.maxWindows = maxWindows;
    this.warmupMs = warmupMs;
  }

  get latest(): FpsSample | null {
    return this.latestSample;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start() {
    if (this.running || typeof window === "undefined") return;
    this.running = true;
    document.addEventListener("visibilitychange", this.handleVisibility);
    if (document.visibilityState === "visible") this.resume();
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.pause();
  }

  private resume() {
    this.resetWindow();
    this.lastTime = null;
    this.warmupUntil = performance.now() + this.warmupMs;
    if (this.rafId === null) this.rafId = window.requestAnimationFrame(this.tick);
  }

  private pause() {
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.lastTime = null;
    this.resetWindow();
  }

  private resetWindow() {
    this.frames = 0;
    this.elapsed = 0;
  }

  private readonly handleVisibility = () => {
    if (document.visibilityState === "visible") this.resume();
    else this.pause();
  };

  private readonly tick = (now: number) => {
    this.rafId = window.requestAnimationFrame(this.tick);

    const last = this.lastTime;
    this.lastTime = now;
    if (last === null || now < this.warmupUntil) return;

    const delta = now - last;
    if (delta > SUSPENDED_FRAME_MS) {
      this.resetWindow();
      return;
    }

    this.frames += 1;
    this.elapsed += Math.min(delta, SLOW_FRAME_MS);
    if (this.elapsed < this.windowMs) return;

    const fps = (this.frames * 1000) / this.elapsed;
    this.resetWindow();
    this.windows.push(fps);
    if (this.windows.length > this.maxWindows) this.windows.shift();

    const average = this.windows.reduce((sum, value) => sum + value, 0) / this.windows.length;
    const sample: FpsSample = { fps, average, windows: [...this.windows] };
    this.latestSample = sample;
    this.listeners.forEach((listener) => listener(sample));
  };
}
