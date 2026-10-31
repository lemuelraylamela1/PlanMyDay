import { fairytale } from "@/features/invitations/components/fairytale/fairytale-tokens";

const paperNoise =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.33 0 0 0 0 0.18 0 0 0 0.22 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const grainOverlay =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

/** Aged parchment: fibre noise, darkened edges, and warm uneven tone. */
export const parchmentBackground = [
  paperNoise,
  "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 58%, rgba(139, 98, 48, 0.24) 100%)",
  "radial-gradient(ellipse 40% 30% at 22% 18%, rgba(232, 212, 168, 0.14), transparent 70%)",
  "radial-gradient(ellipse 35% 28% at 80% 84%, rgba(201, 184, 232, 0.08), transparent 70%)",
  `linear-gradient(180deg, #f1e2c1 0%, #fcf5e6 12%, ${fairytale.ivory} 50%, #fbf1dc 88%, #ecdab5 100%)`,
].join(", ");

/** Softer paper used for page sections and image placeholders. */
export const pageParchment = [
  paperNoise,
  `linear-gradient(180deg, ${fairytale.ivory} 0%, #FBF4EA 100%)`,
].join(", ");

export const rodBackground =
  "linear-gradient(180deg, #a88b5c 0%, #e9d8b2 22%, #fbf3e0 40%, #f1e2c0 58%, #c9ae7d 80%, #8a6f45 100%)";

export const finialBackground =
  "radial-gradient(circle at 35% 30%, #fbecc4 0%, #d9b877 35%, #a07c45 70%, #6b5230 100%)";

export const waxSealBackground =
  `radial-gradient(circle at 34% 30%, #d99aa4 0%, ${fairytale.dustyRose} 38%, #8f4a57 72%, #6e3540 100%)`;

export const stoneBackground = [
  "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.18) 0 1px, transparent 1px 54px)",
  "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(232, 212, 168, 0.1), transparent 70%)",
  "radial-gradient(ellipse 40% 30% at 80% 70%, rgba(201, 184, 232, 0.06), transparent 70%)",
  `linear-gradient(180deg, #343652 0%, ${fairytale.midnight} 55%, #1a1c2e 100%)`,
].join(", ");
