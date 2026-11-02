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

/** Ambient background music path. */
export const AMBIENT_MUSIC_SRC = "/proposal-audio/i-see-the-light.mp3";
