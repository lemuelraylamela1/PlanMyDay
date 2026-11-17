/** One full-bleed portrait-hero slide. */
export interface PortraitHeroImage {
  src: string;
  alt: string;
  objectPosition: string;
  mobileObjectPosition: string;
}

/**
 * Full-bleed rotating hero after the lantern sky section.
 * Pulls every photo from `public/gallery/1`, `2`, and `3`.
 */
export const portraitHeroImages: PortraitHeroImage[] = [
  ...Array.from({ length: 17 }, (_, index) => {
    const n = String(index + 1).padStart(2, "0");
    return {
      src: `/gallery/1/${n}.jpg`,
      alt: `Gallery moment ${n}`,
      objectPosition: "50% 42%",
      mobileObjectPosition: "50% 36%",
    };
  }),
  ...Array.from({ length: 14 }, (_, index) => {
    const n = String(index + 1).padStart(2, "0");
    return {
      src: `/gallery/2/${n}.jpg`,
      alt: `Gallery moment ${n}`,
      objectPosition: "50% 45%",
      mobileObjectPosition: "50% 38%",
    };
  }),
  ...Array.from({ length: 16 }, (_, index) => {
    const n = String(index + 1).padStart(2, "0");
    return {
      src: `/gallery/3/${n}.jpg`,
      alt: `Gallery moment ${n}`,
      objectPosition: "50% 44%",
      mobileObjectPosition: "50% 37%",
    };
  }),
];

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
  captions: readonly string[],
): GallerySet {
  return {
    id,
    title,
    description,
    images: captions.map((caption, index) => {
      const n = String(index + 1).padStart(2, "0");
      return {
        src: `/gallery/${id}/${n}.jpg`,
        caption,
      };
    }),
  };
}

/** Fairytale blue gown + prince whites at Fernwood. */
const FAIRYTALE_CAPTIONS = [
  "At the Fernwood Gates",
  "A Promise in Gold Light",
  "Royal Courtyard",
  "Hand in Hand",
  "Carriage Awaits",
  "Once Upon Fernwood",
  "Twirl of the Blue Gown",
  "Looking Back Together",
  "Beneath the Crest",
  "Prince and His Love",
  "Steps Toward Forever",
  "Fairytale Portrait",
  "Golden Hour Royalty",
  "The Ball Begins",
  "Spinning Into Forever",
  "Side by Side",
  "Happily Ever After",
] as const;

/** Blush gown + garden conservatory romance. */
const GARDEN_CAPTIONS = [
  "Through the Conservatory",
  "Among the Ferns",
  "Soft Peach Light",
  "Glasshouse Vows",
  "Lush and In Love",
  "Staircase Serenade",
  "Seated in Bloom",
  "Emerald Embrace",
  "Botanical Romance",
  "Quiet Glance",
  "Under Glass Skies",
  "Garden Whispers",
  "Petals and Promises",
  "Forever in Bloom",
] as const;

/** Twilight, night, and intimate outdoor frames. */
const TWILIGHT_CAPTIONS = [
  "Under the Night Sky",
  "Golden Deck Light",
  "Soft Evening Glow",
  "Close Enough to Dream",
  "Lantern Hour",
  "Whispered Forever",
  "Sunset Between Us",
  "Eyes Only for You",
  "Warm Against the Dusk",
  "Held in Twilight",
  "A Quiet Promise",
  "Stars Above Fernwood",
  "Nightfall Romance",
  "Stillness and You",
  "Moonlit Softness",
  "Our Forever Night",
] as const;

/**
 * Our Gallery — 3 infinite rows from folders `public/gallery/1|2|3`.
 * Folder 1 → fairytale, 2 → garden, 3 → twilight.
 */
export const gallerySets: GallerySet[] = [
  galleryRow(
    "1",
    "Fairytale",
    "Royal moments at Fernwood Gardens.",
    FAIRYTALE_CAPTIONS,
  ),
  galleryRow(
    "2",
    "Garden",
    "Romance in the conservatory.",
    GARDEN_CAPTIONS,
  ),
  galleryRow(
    "3",
    "Twilight",
    "Evening light and quiet vows.",
    TWILIGHT_CAPTIONS,
  ),
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
