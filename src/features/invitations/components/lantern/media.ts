/** Full-bleed rotating hero after the lantern sky section. */
export const portraitHeroImages = [
  {
    src: "/proposal-photos/hero-01.jpg",
    alt: "A quiet moment inside the carriage",
    objectPosition: "50% 42%",
    mobileObjectPosition: "50% 36%",
  },
  {
    src: "/proposal-photos/hero-08.jpg",
    alt: "Beside the royal carriage at Fernwood Gardens",
    objectPosition: "55% 48%",
    mobileObjectPosition: "62% 40%",
  },
  {
    src: "/proposal-photos/hero-10.jpg",
    alt: "Walking hand in hand before Fernwood Gardens",
    objectPosition: "50% 48%",
    mobileObjectPosition: "52% 40%",
  },
  {
    src: "/proposal-photos/hero-09.jpg",
    alt: "Together beside their carriage",
    objectPosition: "50% 40%",
    mobileObjectPosition: "52% 34%",
  },
] as const;

/** Single gallery photo. */
export interface GalleryImage {
  src: string;
  caption: string;
}

/** One categorized gallery row / set. */
export interface GallerySet {
  id: string;
  title: string;
  description?: string;
  images: GalleryImage[];
}

function galleryRow(
  id: string,
  title: string,
  description: string,
  count: number,
): GallerySet {
  return {
    id,
    title,
    description,
    images: Array.from({ length: count }, (_, index) => {
      const n = String(index + 1).padStart(2, "0");
      return {
        src: `/gallery/${id}/${n}.jpg`,
        caption: `${title} · ${n}`,
      };
    }),
  };
}

/**
 * Our Gallery — 3 infinite rows from folders `public/gallery/1|2|3`.
 * Folder 1 → top row, 2 → middle, 3 → bottom.
 */
export const gallerySets: GallerySet[] = [
  galleryRow("1", "Row One", "First gallery row.", 17),
  galleryRow("2", "Row Two", "Second gallery row.", 14),
  galleryRow("3", "Row Three", "Third gallery row.", 16),
];

/** Flat list of all gallery photos. */
export const galleryImages: GalleryImage[] = gallerySets.flatMap((set) => set.images);

/** Venue photo for wedding details. */
export const VENUE_IMAGE = {
  src: "/venue/fernwood-gardens.jpg",
  alt: "The grand Fernwood Gardens entrance in Tagaytay",
} as const;

/** 3D attire guide illustrations by wedding party role. */
export const attireGuideImages = {
  bridesmaids: {
    src: "/attire/bridesmaids.jpg",
    alt: "Bridesmaids in light pink gowns",
  },
  groomsmen: {
    src: "/attire/groomsmen.jpg",
    alt: "Groomsmen in cream suits with pink ties",
  },
  family: {
    src: "/attire/family-barong.jpg",
    alt: "Family in darker pink with gentlemen in barong",
  },
  sponsors: {
    src: "/attire/sponsors.jpg",
    alt: "Sponsors in cream formal wear",
  },
  guests: {
    src: "/attire/guests-v3.jpg",
    alt: "Guests in lavender or soft pink formal or semi-formal attire",
  },
} as const;

/** Ambient background music path. */
export const AMBIENT_MUSIC_SRC = "/proposal-audio/i-see-the-light.mp3";

/** Save-the-date film (2K desktop / 720p phones). */
export const SAVE_THE_DATE_VIDEO = {
  src: "/proposal-video/save-the-date.mp4",
  mobileSrc: "/proposal-video/save-the-date-720.mp4",
  posterSrc: "/proposal-video/save-the-date-poster.jpg",
  title: "Save the Date",
  width: 2560,
  height: 1440,
  mobileWidth: 1280,
  mobileHeight: 720,
} as const;
