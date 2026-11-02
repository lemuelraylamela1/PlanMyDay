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

/** Gallery images from proposal photos. */
export interface GalleryImage {
  src: string;
  caption: string;
}

export const galleryImages: GalleryImage[] = [
  { src: "/proposal-photos/hero-01.jpg", caption: "The first hello" },
  { src: "/proposal-photos/hero-02.jpg", caption: "Golden hour" },
  { src: "/proposal-photos/hero-03.jpg", caption: "Adventures together" },
  { src: "/proposal-photos/hero-04.jpg", caption: "Quiet moments" },
  { src: "/proposal-photos/hero-05.jpg", caption: "The proposal" },
  { src: "/proposal-photos/hero-06.jpg", caption: "Celebrations" },
  { src: "/proposal-photos/hero-07.jpg", caption: "Family & friends" },
  { src: "/proposal-photos/hero-08.jpg", caption: "Forever begins" },
  { src: "/proposal-photos/hero-09.jpg", caption: "Our story" },
  { src: "/proposal-photos/hero-10.jpg", caption: "The journey" },
];

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
    alt: "Guests in soft pink formal or semi-formal attire",
  },
} as const;

/** Ambient background music path. */
export const AMBIENT_MUSIC_SRC = "/proposal-audio/i-see-the-light.mp3";

/** Save-the-date film (2K / 16:9, GitHub-safe encode). */
export const SAVE_THE_DATE_VIDEO = {
  src: "/proposal-video/save-the-date.mp4",
  title: "Save the Date",
  width: 2560,
  height: 1440,
} as const;
