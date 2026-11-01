import type { AnimationQuality } from "@/features/invitations/components/fairytale/animation-quality/quality-profiles";

export interface DeviceCapabilities {
  /** Approximate RAM in GB (Chromium only; rounded and capped by the browser). */
  deviceMemory: number | null;
  /** Logical CPU cores. Some browsers report a fixed or capped value. */
  cpuCores: number | null;
  webgl: "hardware" | "software" | "unavailable" | "unknown";
  reducedMotion: boolean;
}

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

function positiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * One tiny WebGL context, no drawing. `failIfMajorPerformanceCaveat` makes the
 * browser refuse when it would fall back to a CPU rasterizer.
 */
function probeWebGl(): DeviceCapabilities["webgl"] {
  let gl: WebGLRenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    gl = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!gl) {
      const fallback = canvas.getContext("webgl");
      if (!fallback) return "unavailable";
      fallback.getExtension("WEBGL_lose_context")?.loseContext();
      return "software";
    }

    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null;
    if (typeof renderer === "string" && SOFTWARE_RENDERER.test(renderer)) return "software";
    return "hardware";
  } catch {
    return "unknown";
  } finally {
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/** Client-only. Never call during server rendering. */
export function detectCapabilities(): DeviceCapabilities {
  const nav = navigator as NavigatorWithMemory;
  return {
    deviceMemory: positiveNumber(nav.deviceMemory),
    cpuCores: positiveNumber(nav.hardwareConcurrency),
    webgl: probeWebGl(),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

export interface InitialQuality {
  quality: AnimationQuality;
  /** Highest tier the FPS monitor may upgrade to. */
  ceiling: AnimationQuality;
}

/**
 * Hardware hint for the first frame. Missing signals are neutral — the FPS
 * monitor corrects optimistic guesses within a few seconds.
 *
 * Very low RAM and software rendering cap the tier. Moderate RAM and core
 * count are soft hints (browsers round or clamp them), so sustained measured
 * FPS may still upgrade past them.
 */
export function initialQualityFor(capabilities: DeviceCapabilities): InitialQuality {
  const { deviceMemory, cpuCores, webgl } = capabilities;
  if (webgl === "software") return { quality: "low", ceiling: "low" };
  if (deviceMemory !== null && deviceMemory <= 2) return { quality: "low", ceiling: "balanced" };
  if (webgl === "unavailable") return { quality: "balanced", ceiling: "balanced" };
  if (deviceMemory !== null && deviceMemory <= 4) return { quality: "balanced", ceiling: "high" };
  if (cpuCores !== null && cpuCores <= 4) return { quality: "balanced", ceiling: "high" };
  return { quality: "high", ceiling: "high" };
}
