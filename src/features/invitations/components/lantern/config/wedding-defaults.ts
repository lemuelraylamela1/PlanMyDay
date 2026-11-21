/**
 * Single source of truth for all wedding content defaults.
 * Edit anything here and it updates across the whole lantern experience.
 *
 * Items marked with "PLACEHOLDER" are sensible defaults you can replace.
 */

export type StoryChapter = {
  chapter: string;
  date: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  /** Scale the photo to crop letterboxing / pillarboxing (1 = normal). */
  imageZoom?: number;
};

export type Hotel = {
  name: string;
  distance: string;
  description: string;
  priceNote: string;
  url?: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export const weddingDefaults = {
  couple: {
    // Display order on the site. The first listed name appears first.
    order: ["groom", "bride"] as const,
    groom: {
      first: "Lemuel",
      full: "Lemuel Ray Lamela",
    },
    bride: {
      first: "Grazielle",
      full: "Grazielle Anne Villa",
    },
  },

  event: {
    // ISO is used for the live countdown. Ceremony at 3:00 PM Philippine time (UTC+8).
    isoDate: "2027-01-16T15:00:00+08:00",
    dateLong: "January 16, 2027",
    dateShort: "01 · 16 · 2027",
    dayOfWeek: "Saturday",
    ceremony: {
      label: "The Ceremony",
      time: "3:00 PM",
      timezoneNote: "Philippine Time",
      venue: "Fernwood Gardens",
      detail: "Exchange of vows as we become one.",
    },
    reception: {
      label: "The Reception",
      time: "6:00 PM",
      timezoneNote: "Philippine Time",
      venue: "Fernwood Gardens",
      detail: "An evening of dinner, dancing, and celebration.",
    },
    venue: {
      name: "Fernwood Gardens",
      city: "Tagaytay",
      address: "Neogan, Tagaytay City, Cavite, Philippines",
      mapsQuery: "Fernwood Gardens Tagaytay",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Fernwood%20Gardens%20Tagaytay",
      imageSrc: "/venue/fernwood-gardens.jpg",
      imageAlt: "The grand Fernwood Gardens entrance in Tagaytay",
      parkingNote: "Lots of parking spaces available on site",
    },
    dressCode: {
      title: "Wedding Attire",
      subtitle: "A Celebration of Love, Dressed in Elegance",
      eyebrow: "Dress Code",
      guests: "Formal attire in cream, champagne, blush, and dusty rose",
      note: "We kindly invite our beloved family and friends to dress according to our wedding color palette. Your presence and participation will make our celebration even more special.",
      restriction: "White attire, jeans/denim, and T-shirts are strictly prohibited.",
      roles: [
        {
          role: "Secondary Sponsors",
          description: "Women: Formal dresses in shades of pink · Men: Cream Barong Tagalog",
          women: "Formal dresses in shades of pink.",
          men: "Cream Barong Tagalog.",
          swatches: ["#F4C2C2", "#CB7579", "#CB938C", "#F7E7CE"],
          badge: null,
          imageSrc: "/attire/secondary-sponsors.webp",
          imageAlt: "Secondary sponsors in dusty rose formal dress and cream Barong Tagalog",
        },
        {
          role: "Principal Sponsors",
          description: "Formal Attire in Shades of Cream and Champagne",
          women: null,
          men: null,
          swatches: ["#FAEBD7", "#F7E7CE", "#FFE4C4"],
          badge: null,
          imageSrc: "/attire/sponsors-image.webp",
          imageAlt: "Principal sponsors in Antique white, Champagne and Bisque formal attire",
        },
        {
          role: "Team Bride",
          description: "Light Pink Attire (Provided by the Couple)",
          women: null,
          men: null,
          swatches: ["#FFD1DC", "#FFC0CB", "#FC8EAC", "#FFA6C9"],
          badge: "Attire Provided by the Couple",
          imageSrc: "/attire/team-bride-editorial.webp",
          imageAlt: "Team Bride in light pink formal dresses",
        },
        {
          role: "Team Groom",
          description: "Cream Suit with Pink Tie (Provided by the Couple)",
          women: null,
          men: null,
          swatches: ["#ECDEC9", "#F4C2C2"],
          badge: "Attire Provided by the Couple",
          imageSrc: "/attire/team-groom-editorial.webp",
          imageAlt: "Team Groom in cream suits with blush pink ties",
        },
        {
          role: "Wedding Guests",
          description: "Semi-Formal to Formal Attire in Any Shade of Pink or Cream",
          women: null,
          men: null,
          swatches: [
            "#EFC9B4",
            "#FDD9B5",
            "#FFE4C4",
            "#F4C2C2",
            "#FFC0CB",
            "#F2BDCD",
            "#E4BCAC",
            "#CB938C",
            "#CB7579",
            "#EEA69D",
          ],
          badge: null,
          imageSrc: "/attire/guests-editorial.webp",
          imageAlt: "Wedding guests in cream, champagne, blush, and dusty rose formal attire",
        },
      ],
    },
  },

  invitation: {
    eyebrow: "A Lantern-Lit Invitation",
    greetingDefault: "Dear {{guestName}}",
    body: "Together with our families, we invite you to step into the light and celebrate our happily ever after.",
    cta: "Release the Lanterns",
  },

  hero: {
    eyebrow: "At Last, We See The Light",
    closing: "Under a sky of lanterns, our next chapter begins.",
  },

  story: {
    eyebrow: "Our Story",
    title: "A Love Written In Lantern Light",
    intro:
      "Open this little book and turn each page—five chapters of chance, adventure, and a vow still rising under lantern light.",
    // PLACEHOLDER chapters — edit freely.
    chapters: [
      {
        chapter: "Chapter One",
        date: "The Music",
        title: "Where It All Began",
        description:
          "It all began with music. We met at a music festival, with him on the guitar and me behind the drums. What started as a shared passion slowly became something more. Little did we know that the music we played together would lead us to a love worth a lifetime.",
        imageSrc: "/gallery/our-story/01.gif",
        imageAlt: "Where it all began — playing music together",
        imageZoom: 1.2,
      },
      {
        chapter: "Chapter Two",
        date: "Every Year, More in Love",
        title: "Growing Together",
        description:
          "Before we knew it, we were celebrating one anniversary after another. Time seemed to fly, but with every year came more memories, deeper love, and a stronger bond. Every year, we found more reasons to choose each other.",
        imageSrc: "/gallery/our-story/02.jpg",
        imageAlt: "Growing together — celebrating another anniversary",
      },
      {
        chapter: "Chapter Three",
        date: "Making Memories Along the Way",
        title: "Adventures Together",
        description:
          "From one place to another, we made countless memories along the way. We found joy in discovering new places, trying new things, and experiencing life side by side. With every adventure, we found ourselves falling in love all over again.",
        imageSrc: "/gallery/our-story/03.jpg",
        imageAlt: "Adventures together — making memories along the way",
      },
      {
        chapter: "Chapter Four",
        date: "One Milestone at a Time",
        title: "Building Our Dreams",
        description:
          "As we grew together, so did our dreams. Little by little, we began turning them into reality, celebrating every milestone and supporting each other through every step. This is one of many dreams we've achieved together, and soon, we look forward to building a home of our own, made possible by our love and hard work.",
        imageSrc: "/gallery/our-story/04.jpg",
        imageAlt: "Building our dreams — one milestone at a time",
      },
      {
        chapter: "Chapter Five",
        date: "The Proposal",
        title: "Forever Starts Here",
        description:
          "And then came the question that would change our forever. With a promise, a ring, and hearts certain of what they wanted, we said yes to a lifetime together. Now, we're ready to begin our most beautiful adventure yet: marriage, and a forever filled with love.",
        imageSrc: "/gallery/our-story/05.jpg",
        imageAlt: "Forever starts here — the proposal",
      },
    ] as StoryChapter[],
  },

  countdown: {
    eyebrow: "The Lanterns Are Rising",
    title: "Until We Say I Do",
    finishedMessage: "Today we celebrate forever.",
  },

  gallery: {
    eyebrow: "Cherished Moments",
    title: "Our Gallery",
    intro:
      "Fairytale, garden, and twilight frames of our story. Drag any row to find a moment — tap for full size.",
  },

  rsvp: {
    eyebrow: "Will You Join Us?",
    title: "Send Your Reply",
    // PLACEHOLDER deadline — update to your real RSVP cut-off.
    deadline: "December 16, 2026",
    intro:
      "Your presence would make our fairytale complete. Please let us know if you can celebrate beneath the lanterns with us.",
    mealOptions: ["Beef", "Chicken", "Fish", "Vegetarian", "No preference"],
    maxGuests: 6,
  },

  faq: {
    eyebrow: "Good to Know",
    title: "Frequently Asked Questions",
    // PLACEHOLDER FAQs — edit to match your day.
    items: [
      {
        question: "When should I RSVP by?",
        answer:
          "Kindly send your response on or before December 16, 2026 so we can finalize arrangements with our venue.",
      },
      {
        question: "What is the dress code?",
        answer:
          "* Secondary Sponsors: Women: Formal Dresses in Shades of Pink. Men: Cream Barong Tagalog.\n* Principal Sponsors: Formal Attire in Shades of Cream and Champagne.\n* Team Bride: Light pink attire (provided by the couple).\n* Team Groom: Cream suit with pink tie (provided by the couple).\n* Guests: Semi-Formal to Formal Attire in Any Shade of Pink or Cream.\n\n* Please take note: White attire, jeans/denim, and T-shirts are strictly prohibited.",
      },
      {
        question: "Can I bring a plus one or children?",
        answer:
          "Strictly no plus ones and no children. We can only accommodate the guests named on your invitation. Thank you for understanding.",
      },
      {
        question: "Will the ceremony and reception be at the same venue?",
        answer:
          "Yes. Both the ceremony and reception will be held at Fernwood Gardens in Tagaytay.",
      },
      {
        question: "Is there parking available?",
        answer: "Yes, the venue provides on-site parking for all guests.",
      },
    ] as Faq[],
  },

  travel: {
    eyebrow: "Plan Your Stay",
    title: "Travel & Accommodation",
    intro:
      "Tagaytay's cool climate and stunning views make it the perfect place to celebrate. Here are a few recommendations for your stay.",
    // PLACEHOLDER hotels — replace with your preferred partners.
    hotels: [
      {
        name: "Hillside Retreat",
        distance: "5 minutes from venue",
        description:
          "A serene mountain-view escape with elegant rooms and warm Filipino hospitality.",
        priceNote: "From ₱4,500 / night",
      },
      {
        name: "Lakeview Suites",
        distance: "10 minutes from venue",
        description: "Modern suites overlooking Taal Lake, ideal for families and groups.",
        priceNote: "From ₱6,200 / night",
      },
      {
        name: "Garden Boutique Inn",
        distance: "8 minutes from venue",
        description: "A charming boutique stay surrounded by lush gardens and quiet comfort.",
        priceNote: "From ₱3,800 / night",
      },
    ] as Hotel[],
    transportation:
      "Tagaytay is roughly a 1.5 to 2 hour drive from Manila. We recommend arranging private transport or a ride-share for comfort. Shuttle details will be shared closer to the date.",
  },

  final: {
    statement:
      "Together with our families, we invite you to celebrate the beginning of our happily ever after beneath a sky full of light.",
    signature: "With all our love,",
    cta: "RSVP Now",
  },

  meta: {
    // PLACEHOLDER — optional extras
    hashtag: "#LemuelAndGrazielleForever",
    contactEmail: "",
  },
} as const;

export type WeddingDefaults = typeof weddingDefaults;

/** Names joined in the configured display order, e.g. "Lemuel & Grazielle". */
export function coupleNames(config: WeddingDefaults, separator = "&"): string {
  const [a, b] = config.couple.order;
  return `${config.couple[a].first} ${separator} ${config.couple[b].first}`;
}

/** Full names joined in display order. */
export function coupleFullNames(config: WeddingDefaults, separator = "and"): string {
  const [a, b] = config.couple.order;
  return `${config.couple[a].full} ${separator} ${config.couple[b].full}`;
}
