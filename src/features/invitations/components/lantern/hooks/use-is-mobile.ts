"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 639px)";
const COMPACT_QUERY = "(max-width: 379px)";
const SHORT_QUERY = "(max-height: 720px)";

function subscribeQuery(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function subscribeViewport(onChange: () => void) {
  const onResize = () => onChange();
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onResize);
  };
}

function readWidth() {
  return Math.round(window.visualViewport?.width ?? window.innerWidth);
}

function readHeight() {
  return Math.round(window.visualViewport?.height ?? window.innerHeight);
}

function subscribeMobile(onChange: () => void) {
  return subscribeQuery(MOBILE_QUERY, onChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getCompactSnapshot() {
  return window.matchMedia(COMPACT_QUERY).matches;
}

function getShortSnapshot() {
  return window.matchMedia(SHORT_QUERY).matches;
}

function getServerBool() {
  return false;
}

function getWidthSnapshot() {
  return readWidth();
}

function getHeightSnapshot() {
  return readHeight();
}

function getServerSize() {
  return 0;
}

/** True on phone-width viewports. SSR-safe (false on server). */
export function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerBool);
}

/**
 * Live phone/tablet viewport metrics so invitation layouts can keep
 * alignment and type scale intact across device sizes (incl. notches /
 * browser chrome via visualViewport).
 */
export function useInviteViewport() {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerBool,
  );
  const isCompact = useSyncExternalStore(
    (onChange) => subscribeQuery(COMPACT_QUERY, onChange),
    getCompactSnapshot,
    getServerBool,
  );
  const isShort = useSyncExternalStore(
    (onChange) => subscribeQuery(SHORT_QUERY, onChange),
    getShortSnapshot,
    getServerBool,
  );
  const width = useSyncExternalStore(
    subscribeViewport,
    getWidthSnapshot,
    getServerSize,
  );
  const height = useSyncExternalStore(
    subscribeViewport,
    getHeightSnapshot,
    getServerSize,
  );

  return { isMobile, isCompact, isShort, width, height };
}

/** Scale particle / lantern counts down on small screens. */
export function mobileCount(desktop: number, mobileRatio = 0.45) {
  if (typeof window === "undefined") return desktop;
  if (!window.matchMedia(MOBILE_QUERY).matches) return desktop;
  return Math.max(4, Math.round(desktop * mobileRatio));
}
