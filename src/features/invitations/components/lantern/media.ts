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

/** One categorized gallery set (5 photos each). */
export interface GallerySet {
  id: string;
  title: string;
  description?: string;
  images: GalleryImage[];
}

/**
 * Our Gallery — 3 sets × 5 images.
 * Replace files in `public/gallery/{set-id}/01.jpg` … `05.jpg` when uploading finals.
 */
export const gallerySets: GallerySet[] = [
  {
    id: "our-story",
    title: "Our Story",
    description: "Where it all began.",
    images: [
      { src: "/gallery/our-story/01.jpg", caption: "The first hello" },
      { src: "/gallery/our-story/02.jpg", caption: "Golden hour" },
      { src: "/gallery/our-story/03.jpg", caption: "Adventures together" },
      { src: "/gallery/our-story/04.jpg", caption: "Quiet moments" },
      { src: "/gallery/our-story/05.jpg", caption: "The proposal" },
    ],
  },
  {
    id: "fairytale",
    title: "Fairytale",
    description: "A day wrapped in lantern light.",
    images: [
      { src: "/gallery/fairytale/01.jpg", caption: "Celebrations" },
      { src: "/gallery/fairytale/02.jpg", caption: "Family & friends" },
      { src: "/gallery/fairytale/03.jpg", caption: "Forever begins" },
      { src: "/gallery/fairytale/04.jpg", caption: "Our story" },
      { src: "/gallery/fairytale/05.jpg", caption: "The journey" },
    ],
  },
  {
    id: "forever",
    title: "Forever",
    description: "Moments we will always keep.",
    images: [
      { src: "/gallery/forever/01.jpg", caption: "Side by side" },
      { src: "/gallery/forever/02.jpg", caption: "Soft glances" },
      { src: "/gallery/forever/03.jpg", caption: "Hand in hand" },
      { src: "/gallery/forever/04.jpg", caption: "Promise kept" },
      { src: "/gallery/forever/05.jpg", caption: "Always yours" },
    ],
  },
];

/** Flat list of all gallery photos (15). */
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

/** Ambient background music path. Temporary stand-in — swap later. */
export const AMBIENT_MUSIC_SRC = "/proposal-audio/gehlee-closer.mp3";

/** Save-the-date film (2K desktop / 720p phones). */
export const SAVE_THE_DATE_VIDEO = {
  src: "/proposal-video/save-the-date.mp4",
  mobileSrc: "/proposal-video/save-the-date-720.mp4",
  title: "Save the Date",
  width: 2560,
  height: 1440,
  mobileWidth: 1280,
  mobileHeight: 720,
} as const;
