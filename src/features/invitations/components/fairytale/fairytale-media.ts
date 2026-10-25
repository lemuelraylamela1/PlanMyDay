/**
 * Photographs for the invitation page.
 *
 * Place files in `public/images/wedding/` and set `src` (for example
 * "/images/wedding/hero.jpg"). Slots with `src: null` render a styled placeholder.
 */

export type MediaOrientation = "portrait" | "landscape" | "square";

export interface FairytaleImage {
  src: string | null;
  alt: string;
  caption?: string;
}

export interface FairytaleHeroImage extends FairytaleImage {
  /** CSS object-position, used to keep faces clear of the caption. */
  objectPosition: string;
  mobileObjectPosition: string;
}

export interface FairytaleGalleryImage extends FairytaleImage {
  orientation: MediaOrientation;
}

export const fairytaleMedia: { hero: FairytaleHeroImage[]; gallery: FairytaleGalleryImage[] } = {
  hero: [
    {
      src: "/proposal-photos/hero-08.jpg",
      alt: "The couple beside a royal carriage at Fernwood Gardens",
      objectPosition: "50% 48%",
      mobileObjectPosition: "64% 50%",
    },
    {
      src: "/proposal-photos/hero-01.jpg",
      alt: "The couple sharing a quiet moment inside an ornate carriage",
      objectPosition: "50% 48%",
      mobileObjectPosition: "52% 50%",
    },
    {
      src: "/proposal-photos/hero-10.jpg",
      alt: "The couple walking hand in hand before Fernwood Gardens",
      objectPosition: "50% 48%",
      mobileObjectPosition: "52% 50%",
    },
  ],
  gallery: [
    {
      src: "/proposal-photos/hero-01.jpg",
      alt: "The couple in their royal carriage",
      orientation: "portrait",
    },
    {
      src: "/proposal-photos/hero-08.jpg",
      alt: "Fernwood Gardens and the royal carriage",
      orientation: "landscape",
    },
    {
      src: "/proposal-photos/hero-04.jpg",
      alt: "The couple holding hands in front of Fernwood Gardens",
      orientation: "landscape",
    },
    {
      src: "/proposal-photos/hero-05.jpg",
      alt: "The couple looking back toward Fernwood Gardens",
      orientation: "portrait",
    },
    {
      src: "/proposal-photos/hero-09.jpg",
      alt: "The couple posed beside their carriage",
      orientation: "portrait",
    },
    {
      src: "/proposal-photos/hero-10.jpg",
      alt: "The couple walking hand in hand",
      orientation: "landscape",
    },
  ],
};
