/**
 * Photographs and film for the invitation page.
 *
 * Media lives in `public/proposal-photos` and `public/proposal-video`.
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

export const fairytaleMedia: {
  hero: FairytaleHeroImage[];
  saveTheDate: { src: string; title: string };
  /** Plays while the scroll opens and dissolves into stars. */
  transitionMusic: { src: string; title: string };
  /** Unlocked on envelope click; starts when the website / hero appears. */
  ambientMusic: { src: string; title: string };
  prenup: FairytaleGalleryImage[];
} = {
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
  saveTheDate: {
    src: "/proposal-video/save-the-date.mp4",
    title: "Save the date",
  },
  transitionMusic: {
    src: "/proposal-audio/magical-ambience.mp3",
    title: "Fantasy Fairy Tale Music Magical — Ethereal Fantasy (528 Hz)",
  },
  ambientMusic: {
    src: "/proposal-audio/i-see-the-light.mp3",
    title: "I See the Light — Mandy Moore & Zachary Levi",
  },
  prenup: [
    {
      src: "/proposal-photos/hero-01.jpg",
      alt: "A quiet moment inside the carriage",
      orientation: "portrait",
      caption: "I",
    },
    {
      src: "/proposal-photos/hero-02.jpg",
      alt: "Prenup portrait among the gardens",
      orientation: "portrait",
      caption: "II",
    },
    {
      src: "/proposal-photos/hero-03.jpg",
      alt: "Walking together through Fernwood",
      orientation: "landscape",
      caption: "III",
    },
    {
      src: "/proposal-photos/hero-04.jpg",
      alt: "Holding hands before Fernwood Gardens",
      orientation: "landscape",
      caption: "IV",
    },
    {
      src: "/proposal-photos/hero-05.jpg",
      alt: "Looking back toward the gardens",
      orientation: "portrait",
      caption: "V",
    },
    {
      src: "/proposal-photos/hero-06.jpg",
      alt: "A soft prenup portrait",
      orientation: "portrait",
      caption: "VI",
    },
    {
      src: "/proposal-photos/hero-07.jpg",
      alt: "Together beneath the trees",
      orientation: "landscape",
      caption: "VII",
    },
    {
      src: "/proposal-photos/hero-08.jpg",
      alt: "Beside the royal carriage",
      orientation: "landscape",
      caption: "VIII",
    },
    {
      src: "/proposal-photos/hero-09.jpg",
      alt: "Posed beside their carriage",
      orientation: "portrait",
      caption: "IX",
    },
    {
      src: "/proposal-photos/hero-10.jpg",
      alt: "Walking hand in hand",
      orientation: "landscape",
      caption: "X",
    },
  ],
};
