"use client";

import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Options {
  enabled: boolean;
  chapterVersion: number;
}

/**
 * Adds camera-like depth to decorative scene layers only. Chapter content
 * remains in normal document flow and individual reveals stay owned by Motion.
 */
export function useChapterScrollTrigger(
  scope: React.RefObject<HTMLElement | null>,
  { enabled, chapterVersion }: Options,
) {
  useGSAP(
    () => {
      if (!enabled || !scope.current) return;

      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions ?? {};
          if (reduceMotion) return;

          const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]", scope.current);
          const depth = desktop ? 1 : 0.32;

          scenes.forEach((scene, index) => {
            const atmosphere = scene.querySelector<HTMLElement>("[data-scene-atmosphere]");
            const backdrop = scene.querySelector<HTMLElement>("[data-scene-backdrop]");
            const veil = scene.querySelector<HTMLElement>("[data-scene-veil]");
            const content = scene.querySelector<HTMLElement>("[data-scene-content]");
            const camera = scene.querySelector<HTMLElement>("[data-scene-camera]");
            const particles = scene.querySelectorAll<HTMLElement>("[data-scene-particle]");

            const timeline = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: scene,
                start: "top bottom",
                end: "bottom top",
                scrub: desktop ? 1.1 : 0.45,
                invalidateOnRefresh: true,
              },
            });

            if (atmosphere) {
              timeline.fromTo(
                atmosphere,
                { yPercent: 2.5 * depth },
                { yPercent: -3.5 * depth, duration: 1 },
                0,
              );
            }

            if (backdrop) {
              timeline.fromTo(
                backdrop,
                { scale: 1.01 },
                { scale: 1 + 0.07 * depth, duration: 1 },
                0,
              );
            }

            if (veil) {
              timeline.fromTo(
                veil,
                { opacity: index === 0 ? 0.24 : 0.78 },
                { keyframes: { opacity: [0.78, 0.36, 0.12] }, duration: 0.62 },
                0,
              );
            }

            if (content) {
              timeline.fromTo(
                content,
                { y: 14 * depth },
                { y: -10 * depth, duration: 1 },
                0,
              );
            }

            if (camera) {
              timeline.fromTo(
                camera,
                { scale: 1 },
                { scale: 1 + 0.075 * depth, duration: 1 },
                0,
              );
            }

            if (particles.length > 0) {
              timeline.fromTo(
                particles,
                { y: 18 * depth, opacity: 0.15 },
                {
                  y: -42 * depth,
                  opacity: desktop ? 0.72 : 0.4,
                  stagger: 0.025,
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
    { scope, dependencies: [enabled, chapterVersion], revertOnUpdate: true },
  );
}
