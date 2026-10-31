/** Cinematic Fantasy Romance palette — invite experience only. */
export const fairytale = {
  ivory: "#FFFDF8",
  champagne: "#E8D4A8",
  gold: "#DDBF8D",
  blush: "#E8B8C7",
  lavender: "#C9B8E8",
  midnight: "#22243A",
  dustyRose: "#B76E79",
  ink: "#4a3236",
  inkMuted: "#6d4a50",
  inkSoft: "#7a5d62",
  cream: "#F3E7D3",
  creamSoft: "#F8EFE2",
  parchmentEdge: "#9b7b62",
  goldDeep: "#C9A66B",
} as const;

export type FairytaleColor = (typeof fairytale)[keyof typeof fairytale];

/** Soft atmospheric washes (use in style.backgroundImage). Warm-led; lavender kept subtle. */
export const fairytaleAtmosphere = {
  champagneMist:
    "radial-gradient(ellipse 70% 42% at 50% 0%, rgba(232,212,168,0.36), transparent 72%)",
  lavenderMist:
    "radial-gradient(ellipse 55% 40% at 50% 35%, rgba(201,184,232,0.06), transparent 72%)",
  goldMist:
    "radial-gradient(ellipse 55% 40% at 50% 35%, rgba(221,191,141,0.18), transparent 72%)",
  blushGlow:
    "radial-gradient(ellipse 58% 48% at 50% 28%, rgba(232,184,199,0.28), transparent 72%)",
  midnightPlane: `linear-gradient(180deg, ${fairytale.midnight} 0%, #2a2c45 48%, #1a1c2e 100%)`,
  duskShell: `radial-gradient(ellipse 55% 40% at 50% 35%, rgba(201,184,232,0.06), transparent 72%), radial-gradient(ellipse 50% 36% at 50% 40%, rgba(232,212,168,0.16), transparent 70%), linear-gradient(180deg, #2a2c45 0%, ${fairytale.midnight} 52%, #1a1c2e 100%)`,
  /** Bottom-weighted so couple photos stay clear above the fold. */
  heroVignette:
    "linear-gradient(180deg, rgba(34,36,58,0.12) 8%, rgba(34,36,58,0.28) 42%, rgba(34,36,58,0.78) 78%, rgba(34,36,58,0.96) 100%)",
  heroVignetteDesktop:
    "linear-gradient(90deg, rgba(34,36,58,0.52) 0%, rgba(34,36,58,0.1) 48%, transparent 72%), linear-gradient(0deg, rgba(34,36,58,0.88) 0%, rgba(34,36,58,0.35) 28%, transparent 58%)",
} as const;
