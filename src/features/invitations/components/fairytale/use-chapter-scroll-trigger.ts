"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  QUALITY_PROFILES,
  type AnimationQuality,
} from "@/features/invitations/components/fairytale/animation-quality/quality-profiles";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Options {
  enabled: boolean;
  chapterVersion: number;
  quality?: AnimationQuality;
}

/**
 * Adds camera-like depth to decorative scene layers only. Chapter content
 * remains in normal document flow — Motion owns content reveals / parallax so
 * GSAP does not scrub `[data-scene-content]` (avoids stacked Y motion).
 *
 * Depth scales with the animation quality; the low tier keeps only the soft
 * veil fade so scenes still breathe without scrubbed transforms.
 */
export function useChapterScrollTrigger(
  scope: React.RefObject<HTMLElement | null>,
  { enabled, chapterVersion, quality = "high" }: Options,
) {
  useGSAP(
    () => {
      if (!enabled || !scope.current) return;

      const media = gsap.matchMedia();
      const qualityDepth = QUALITY_PROFILES[quality].parallax;

      media.add(
        {
          desktop: "(min-width: 640px)",
          mobile: "(max-width: 639px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions ?? {};
          if (reduceMotion) return;

          const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]", scope.current);
          // Phones keep shallower depth so layers don't swim on small screens.
          const depth = (desktop ? 1 : 0.28) * qualityDepth;
          const transforms = depth > 0;

          scenes.forEach((scene, index) => {
            const atmosphere = scene.querySelector<HTMLElement>("[data-scene-atmosphere]");
            const backdrop = scene.querySelector<HTMLElement>("[data-scene-backdrop]");
            const veil = scene.querySelector<HTMLElement>("[data-scene-veil]");
            const camera = scene.querySelector<HTMLElement>("[data-scene-camera]");
            const particles = scene.querySelectorAll<HTMLElement>("[data-scene-particle]");

            const timeline = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: scene,
                start: "top bottom",
                end: "bottom top",
                scrub: desktop && quality === "high" ? 0.85 : 0.4,
                invalidateOnRefresh: true,
              },
            });

            if (atmosphere && transforms) {
              timeline.fromTo(
                atmosphere,
                { yPercent: 1.8 * depth },
                { yPercent: -2.4 * depth, duration: 1 },
                0,
              );
            }

            if (backdrop && transforms) {
              timeline.fromTo(
                backdrop,
                { scale: 1.008 },
                { scale: 1 + 0.045 * depth, duration: 1 },
                0,
              );
            }

            if (veil) {
              timeline.fromTo(
                veil,
                { opacity: index === 0 ? 0.22 : 0.7 },
                { keyframes: { opacity: [0.7, 0.34, 0.14] }, duration: 0.62 },
                0,
              );
            }

            if (camera && transforms) {
              timeline.fromTo(
                camera,
                { scale: 1 },
                { scale: 1 + 0.05 * depth, duration: 1 },
                0,
              );
            }

            if (particles.length > 0 && transforms) {
              timeline.fromTo(
                particles,
                { y: 12 * depth, opacity: 0.12 },
                {
                  y: -28 * depth,
                  opacity: desktop ? 0.55 : 0.32,
                  stagger: 0.03,
                  duration: 0.8,
                },
                0.08,
              );
            }
          });
        },
      );

      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.cancelAnimationFrame(refreshFrame);
        media.revert();
      };
    },
    { scope, dependencies: [enabled, chapterVersion, quality], revertOnUpdate: true },
  );
}
