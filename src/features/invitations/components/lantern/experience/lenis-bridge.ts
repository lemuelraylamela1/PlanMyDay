import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setActiveLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getActiveLenis() {
  return lenis;
}
