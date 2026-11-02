"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** True on phone-width viewports. SSR-safe (false on server). */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Scale particle / lantern counts down on small screens. */
export function mobileCount(desktop: number, mobileRatio = 0.45) {
  if (typeof window === "undefined") return desktop;
  if (!window.matchMedia(QUERY).matches) return desktop;
  return Math.max(4, Math.round(desktop * mobileRatio));
}
