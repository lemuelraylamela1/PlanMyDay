"use client";

import * as React from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useExperience } from "./experience-provider";
import { useLanternPerf } from "../performance/lantern-perf-provider";
import { setActiveLenis } from "./lenis-bridge";

/** Enables Lenis smooth scrolling once the site is revealed (desktop high tier only). */
export function SmoothScroll() {
  const { phase, reducedMotion } = useExperience();
  const { profile, compact } = useLanternPerf();

  React.useEffect(() => {
    if (phase !== "revealed" || reducedMotion) return;
    if (!profile.smoothScroll || compact) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    setActiveLenis(lenis);

    // Keep GSAP ScrollTrigger (story wand path, etc.) in sync with Lenis.
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Smoothly scroll for in-page anchor links.
    // Full-viewport sections (#hero, #portrait, …) must land flush — no header offset.
    // #portrait / #rsvp use dedicated cinematic scroll (longer duration).
    const onAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!target) return;
      const id = target.getAttribute("href");
      if (!id || id === "#" || id === "#portrait" || id === "#rsvp") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, {
          offset: 0,
          immediate: false,
          lock: true,
        });
      }
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onAnchorClick);
      lenis.off("scroll", onLenisScroll);
      setActiveLenis(null);
      lenis.destroy();
    };
  }, [phase, reducedMotion, profile.smoothScroll, compact]);

  return null;
}
