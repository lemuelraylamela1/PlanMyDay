import { getActiveLenis } from "../experience/lenis-bridge";

/** Ease-in-out cubic — soft start and soft landing. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type ScrollToSectionOptions = {
  /** Animation length in ms. Default 2200. */
  duration?: number;
  offset?: number;
  /** Called once when the scroll finishes (or is skipped). */
  onComplete?: () => void;
  /** Called every frame with 0→1 progress. */
  onProgress?: (progress: number) => void;
};

let activeFrame = 0;

/**
 * Slow, cinematic scroll to an in-page section.
 * Uses Lenis when active (desktop high); otherwise a RAF window scroll.
 * Instant jump when the user prefers reduced motion.
 */
export function scrollToSection(
  id: string,
  {
    duration = 2200,
    offset = 0,
    onComplete,
    onProgress,
  }: ScrollToSectionOptions = {},
) {
  const target = document.getElementById(id.replace(/^#/, ""));
  if (!target) {
    onComplete?.();
    return;
  }

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || duration <= 0) {
    const lenis = getActiveLenis();
    if (lenis) {
      lenis.scrollTo(target, { offset, immediate: true });
    } else {
      const to = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo(0, to);
    }
    onProgress?.(1);
    onComplete?.();
    return;
  }

  if (activeFrame) cancelAnimationFrame(activeFrame);

  const lenis = getActiveLenis();
  if (lenis) {
    const startY = window.scrollY;
    const endY = target.getBoundingClientRect().top + window.scrollY + offset;
    const distance = endY - startY;
    if (Math.abs(distance) < 2) {
      onProgress?.(1);
      onComplete?.();
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;
      const progress = Math.min(1, Math.max(0, (y - startY) / distance));
      onProgress?.(progress);
    };
    lenis.on("scroll", onScroll);
    lenis.scrollTo(target, {
      offset,
      duration: duration / 1000,
      easing: easeInOutCubic,
      lock: true,
      onComplete: () => {
        lenis.off("scroll", onScroll);
        onProgress?.(1);
        onComplete?.();
      },
    });
    return;
  }

  const from = window.scrollY;
  const to = target.getBoundingClientRect().top + window.scrollY + offset;
  const distance = to - from;
  if (Math.abs(distance) < 2) {
    onProgress?.(1);
    onComplete?.();
    return;
  }

  const start = performance.now();

  const tick = (now: number) => {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(t);
    window.scrollTo(0, from + distance * eased);
    onProgress?.(eased);
    if (t < 1) {
      activeFrame = requestAnimationFrame(tick);
    } else {
      activeFrame = 0;
      onComplete?.();
    }
  };

  activeFrame = requestAnimationFrame(tick);
}
