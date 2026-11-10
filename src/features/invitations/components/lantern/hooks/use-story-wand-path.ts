"use client";

import * as React from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

type Options = {
  enabled: boolean;
  /** Spawn glowing star trail from the wand tip while scrubbing. */
  starTrail: boolean;
  /** Max simultaneous trail particles. */
  maxStars?: number;
};

/**
 * Scroll-scrubbed MotionPath for the Our Story magic wand — mirrors the
 * GreenSock "plot through points" pattern, rebuilt on resize.
 */
export function useStoryWandPath(
  scope: React.RefObject<HTMLElement | null>,
  { enabled, starTrail, maxStars = 18 }: Options,
) {
  React.useEffect(() => {
    const root = scope.current;
    if (!root || !enabled) {
      if (root) {
        root.querySelectorAll<HTMLElement>(".story-chapter").forEach((el) => {
          el.classList.add("is-lit");
        });
        const wand = root.querySelector<HTMLElement>(".story-wand");
        if (wand) wand.style.visibility = "hidden";
        const trail = root.querySelector<HTMLElement>(".story-star-trail");
        if (trail) trail.replaceChildren();
      }
      return;
    }

    let ctx: gsap.Context | undefined;
    let resizeTimer: number | undefined;

    const createTimeline = () => {
      ctx?.revert();

      ctx = gsap.context(() => {
        const wand = root.querySelector<HTMLElement>(".story-wand");
        const startMarker = root.querySelector<HTMLElement>(".story-path-start");
        const endMarker = root.querySelector<HTMLElement>(".story-path-end");
        const chapters = gsap.utils.toArray<HTMLElement>(".story-chapter", root);
        const trail = root.querySelector<HTMLElement>(".story-star-trail");

        if (!wand || !startMarker || chapters.length === 0) return;

        chapters.forEach((chapter) => chapter.classList.remove("is-lit"));
        gsap.set(wand, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
          clearProps: "visibility",
        });

        const wandStartRect = wand.getBoundingClientRect();
        const originX = wandStartRect.left + wandStartRect.width / 2;
        const originY = wandStartRect.top + wandStartRect.height / 2;

        const toPoint = (el: HTMLElement) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - originX,
            y: r.top + r.height / 2 - originY,
          };
        };

        // Sequential cinematic spreads: path arcs through each chapter marker,
        // then settles on the end glow. Curviness keeps a gentle lantern-trail zigzag.
        const points = [
          ...chapters.map((chapter) => {
            const marker =
              chapter.querySelector<HTMLElement>(".story-chapter-marker") || chapter;
            return toPoint(marker);
          }),
          ...(endMarker ? [toPoint(endMarker)] : []),
        ];

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: startMarker,
            start: "clamp(top center)",
            endTrigger: endMarker ?? chapters[chapters.length - 1],
            end: "clamp(bottom center)",
            scrub: 1.15,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          wand,
          {
            duration: 1,
            ease: "none",
            motionPath: {
              path: points,
              curviness: 1.35,
              // Tip leads along the path (SVG wand points up / -Y).
              autoRotate: 90,
            },
          },
          0,
        );

        // Light chapter i as the wand nears that waypoint (points include end marker).
        const segmentCount = Math.max(points.length, 1);
        const thresholds = chapters.map((_, i) =>
          Math.min(0.92, (i + 0.42) / segmentCount),
        );

        let lastSpawn = 0;
        let lastProgress = -1;
        const spawnStar = () => {
          if (!starTrail || !trail) return;
          const now = performance.now();
          if (now - lastSpawn < 70) return;
          lastSpawn = now;

          while (trail.childElementCount >= maxStars) {
            trail.firstElementChild?.remove();
          }

          const tip = wand.querySelector<HTMLElement>(".story-wand-tip") || wand;
          const tipRect = tip.getBoundingClientRect();
          const rootRect = root.getBoundingClientRect();
          const star = document.createElement("span");
          star.className = "story-star";
          const driftX = (Math.random() - 0.5) * 48;
          const driftY = -18 - Math.random() * 36;
          const size = 3 + Math.random() * 5;
          star.style.left = `${tipRect.left + tipRect.width / 2 - rootRect.left}px`;
          star.style.top = `${tipRect.top + tipRect.height / 2 - rootRect.top}px`;
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;
          star.style.setProperty("--star-drift-x", `${driftX}px`);
          star.style.setProperty("--star-drift-y", `${driftY}px`);
          trail.appendChild(star);
          window.setTimeout(() => star.remove(), 1200);
        };

        const syncFromProgress = () => {
          const progress = tl.progress();
          chapters.forEach((chapter, i) => {
            const threshold = thresholds[i] ?? 1;
            chapter.classList.toggle("is-lit", progress >= threshold);
          });
          if (Math.abs(progress - lastProgress) > 0.003) {
            spawnStar();
            lastProgress = progress;
          }
        };

        tl.eventCallback("onUpdate", syncFromProgress);
        // Align lit state if the section is already mid-scroll on mount/resize.
        syncFromProgress();
      }, root);
    };

    // Wait a frame so absolute layout / fonts settle before measuring.
    const raf = window.requestAnimationFrame(() => {
      createTimeline();
      ScrollTrigger.refresh();
    });

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        createTimeline();
        ScrollTrigger.refresh();
      }, 160);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, [scope, enabled, starTrail, maxStars]);
}
