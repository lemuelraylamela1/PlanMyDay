"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Fleuron,
  GoldCorner,
  GoldDivider,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay, pageParchment } from "@/features/invitations/components/fairytale/textures";
import {
  gallerySets,
  portraitHeroImages,
  type GalleryImage,
} from "@/features/invitations/components/lantern/media";
import { InfiniteSlider } from "@/components/ui/infinite-slider-horizontal";

const PROPOSAL_MUSIC_SRC = "/proposal-audio/it-might-be-you.mp3";
const SAVE_THE_DATE_VIDEO_SRC = "/proposal-video/save-the-date.mp4";
const SAVE_THE_DATE_POSTER_SRC = "/proposal-video/save-the-date-poster.jpg";
const HERO_ROTATE_MS = 3000;

/** Slightly larger labels for elderly guests — local to the proposal page. */
const proposalSmallCaps = cn(smallCaps, "text-[12px] tracking-[0.22em] sm:text-[13px] sm:tracking-[0.28em]");

const heroTextShadow = "[text-shadow:0_1px_2px_rgba(0,0,0,0.75),0_2px_12px_rgba(0,0,0,0.45)]";

/** High-contrast parchment palette for older guests / poor eyesight. */
const ink = {
  body: "text-[#1a1214]",
  heading: "text-[#140f11]",
  secondary: "text-[#2a181c]",
  accent: "text-[#5c2a34]",
  muted: "text-[#3a2824]",
  footer: "text-[#3a2818]",
} as const;

export interface ProposalImage {
  id: string;
  url: string;
  fileName: string;
  caption: string | null;
}

/** Opening hero slides — every photo from public/gallery/1, 2, and 3. */
export const proposalHeroImages: ProposalImage[] = portraitHeroImages.map((image, index) => ({
  id: `gallery-hero-${index + 1}`,
  url: image.src,
  fileName: image.alt,
  caption: image.alt,
}));

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const ease = [0.22, 1, 0.36, 1] as const;

const SWIPE_OFFSET = 72;
const SWIPE_VELOCITY = 450;

function pickRandomIndex(exclude: number, length: number) {
  if (length <= 1) return 0;
  let next = exclude;
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

const lightMotes = [
  { left: "8%", size: 3, duration: 16, delay: 0, drift: 14 },
  { left: "18%", size: 2, duration: 19, delay: 2.4, drift: -10 },
  { left: "31%", size: 4, duration: 14, delay: 1.1, drift: 8 },
  { left: "46%", size: 2, duration: 21, delay: 4.6, drift: -16 },
  { left: "58%", size: 3, duration: 17, delay: 0.6, drift: 12 },
  { left: "71%", size: 2, duration: 15, delay: 3.2, drift: -8 },
  { left: "82%", size: 4, duration: 18, delay: 5.4, drift: 18 },
  { left: "91%", size: 2, duration: 22, delay: 1.8, drift: -12 },
];

export function ProposalExperience({
  images,
  coupleNames,
  honoreeName,
  rolePhrase,
  message,
  dateLabel,
  timeLabel,
  venueName,
  children,
}: {
  images: ProposalImage[];
  coupleNames: string;
  honoreeName: string;
  rolePhrase: string;
  message: string;
  dateLabel: string | null;
  timeLabel: string | null;
  venueName: string | null;
  children: React.ReactNode;
}) {
  const calm = usePrefersReducedMotion();
  const [active, setActive] = React.useState(0);
  const [outgoing, setOutgoing] = React.useState<number | null>(null);
  const [opened, setOpened] = React.useState(false);
  const [musicPlaying, setMusicPlaying] = React.useState(false);
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const musicPausedByVideoRef = React.useRef(false);
  const activeRef = React.useRef(0);
  const photos = proposalHeroImages.length > 0 ? proposalHeroImages : images;
  const cover = photos[0];
  const [compactGallery, setCompactGallery] = React.useState(false);

  useIsoLayoutEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const apply = () => setCompactGallery(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useIsoLayoutEffect(() => {
    if (calm) setOpened(true);
  }, [calm]);

  const showPhoto = React.useCallback(
    (index: number) => {
      const current = activeRef.current;
      if (index === current || photos.length === 0) return;
      setOutgoing(current);
      activeRef.current = index;
      setActive(index);
    },
    [photos.length],
  );

  React.useEffect(() => {
    if (!opened || calm || photos.length < 2) return;
    const timer = window.setInterval(() => {
      showPhoto(pickRandomIndex(activeRef.current, photos.length));
    }, HERO_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [opened, photos.length, calm, showPhoto]);

  React.useEffect(() => {
    if (outgoing === null) return;
    const id = window.setTimeout(() => setOutgoing(null), 1800);
    return () => window.clearTimeout(id);
  }, [outgoing, active]);

  async function startMusic() {
    const audio = audioRef.current;
    if (!audio) return false;
    audio.loop = true;
    audio.volume = 0.7;
    try {
      await audio.play();
      setMusicPlaying(true);
      return true;
    } catch {
      setMusicPlaying(false);
      return false;
    }
  }

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.7;
    return () => {
      audio.pause();
    };
  }, []);

  async function openInvitation() {
    // Gate stays until the guest taps — never auto-open on music preload.
    await startMusic();
    setOpened(true);
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      videoRef.current?.pause();
      setVideoPlaying(false);
      musicPausedByVideoRef.current = false;
      await startMusic();
      return;
    }
    audio.pause();
    setMusicPlaying(false);
  }

  function pauseAmbientForVideo() {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    musicPausedByVideoRef.current = true;
    audio.pause();
    setMusicPlaying(false);
  }

  async function playInvitationFilm() {
    const video = videoRef.current;
    if (!video) return;
    pauseAmbientForVideo();
    video.muted = false;
    try {
      await video.play();
      setVideoPlaying(true);
    } catch {
      setVideoPlaying(false);
    }
  }

  function handleVideoPlay() {
    setVideoPlaying(true);
    pauseAmbientForVideo();
  }

  function handleVideoPause() {
    const video = videoRef.current;
    setVideoPlaying(Boolean(video && !video.paused));
  }

  function handleVideoEnded() {
    setVideoPlaying(false);
    if (musicPausedByVideoRef.current) {
      musicPausedByVideoRef.current = false;
      void startMusic();
    }
  }

  function arrive(delay = 0) {
    if (calm) return {};
    return {
      initial: { opacity: 0, y: 18 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "0px 0px -8% 0px" },
      transition: { duration: 0.95, delay, ease },
    };
  }

  function rise(delay: number) {
    if (calm) return {};
    return {
      initial: { opacity: 0, y: 20 },
      animate: opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { duration: 1.05, delay: opened ? delay : 0, ease },
    };
  }

  const visibleSlides = new Set<number>([active]);
  if (outgoing !== null && outgoing !== active && photos[outgoing]) visibleSlides.add(outgoing);

  return (
    <main className={cn("bg-[#FFFDF8]", ink.body)}>
      <audio ref={audioRef} src={PROPOSAL_MUSIC_SRC} preload="auto" loop playsInline />
      <AnimatePresence>
        {!opened && (
          <motion.div
            key="open-invitation"
            className="fixed inset-0 z-50 overflow-hidden bg-[#1c1619] motion-reduce:hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: calm ? 0 : 1.15, ease } }}
          >
            {cover && (
              <Image
                src={cover.url}
                alt=""
                fill
                priority
                unoptimized
                sizes="100vw"
                className="scale-110 object-cover blur-[8px]"
              />
            )}
            <div aria-hidden className="absolute inset-0 bg-[#140f11]/68" />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,15,17,0.15)_0%,rgba(20,15,17,0.72)_78%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,191,141,0.2),transparent_68%)]"
            />
            <LightMotes paused={calm} />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
              style={{ backgroundImage: grainOverlay }}
            />
            <button
              type="button"
              onClick={openInvitation}
              className={cn(
                "relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center text-[#FFFDF8]",
                heroTextShadow,
              )}
              aria-label="Open invitation and play music"
            >
              <motion.span
                className="flex flex-col items-center"
                initial={calm ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease, delay: 0.12 }}
              >
                <Fleuron className="text-[#FFEFD6]" />
                <p className={cn(proposalSmallCaps, "mt-6 text-[#FFEFD6]")}>A special invitation</p>
                <p
                  className={cn(
                    displayFont,
                    "mt-5 max-w-3xl text-balance text-[2.7rem] font-light leading-[0.98] sm:text-7xl",
                  )}
                >
                  {coupleNames}
                </p>
                <p className={cn(scriptFont, "mt-4 text-4xl text-[#FFEFD6] sm:text-5xl")}>
                  For {honoreeName}
                </p>
                <motion.span
                  className="mt-12 inline-flex h-28 w-28 items-center justify-center rounded-full border border-[#DDBF8D]/75"
                  animate={
                    calm
                      ? undefined
                      : {
                          scale: [1, 1.045, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(221,191,141,0.32)",
                            "0 0 0 16px rgba(221,191,141,0)",
                            "0 0 0 0 rgba(221,191,141,0)",
                          ],
                        }
                  }
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full border border-[#DDBF8D]/80 bg-[#1a1214]/40 text-[#FFEFD6] backdrop-blur-[2px]">
                    <Volume2 className="h-5 w-5" />
                  </span>
                </motion.span>
                <span className={cn(proposalSmallCaps, "mt-5 text-[#FFEFD6]")}>Tap to open</span>
              </motion.span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {opened && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={musicPlaying ? "Mute music" : "Play music"}
          className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#E8B8C7] bg-[#FFFDF8]/95 text-[#5c2a34] shadow-md backdrop-blur-sm"
        >
          {musicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}
      <section className="relative h-svh overflow-hidden bg-[#1c1619]" inert={!opened}>
        {photos.map((photo, index) =>
          visibleSlides.has(index) ? (
            <CinematicFrame
              key={photo.id}
              photo={photo}
              active={index === active}
              opened={opened}
              reduceMotion={calm}
              fadeIn={index === active && outgoing !== null && !calm}
              priority={index === 0}
            />
          ) : null,
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,17,0.18)_0%,rgba(18,14,17,0.05)_34%,rgba(18,14,17,0.42)_62%,rgba(18,14,17,0.88)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{ backgroundImage: grainOverlay }}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-[max(1.35rem,env(safe-area-inset-bottom))] text-center text-[#FFFDF8]",
            heroTextShadow,
          )}
        >
          {dateLabel && (
            <motion.p {...rise(0.28)} className={cn(proposalSmallCaps, "text-[#FFEFD6]")}>
              {dateLabel}
            </motion.p>
          )}
          <motion.p
            {...rise(0.42)}
            className={cn(
              displayFont,
              "mt-3 max-w-4xl text-balance text-[2.45rem] font-light leading-[0.98] sm:text-6xl",
            )}
          >
            {coupleNames}
          </motion.p>
          <motion.p
            {...rise(0.56)}
            className="mt-4 max-w-md text-balance font-serif text-lg italic leading-snug text-[#FFFDF8] sm:text-2xl"
          >
            Will you be {rolePhrase}?
          </motion.p>
          <motion.p
            {...rise(0.7)}
            className={cn(scriptFont, "mt-3 text-4xl text-[#FFEFD6] sm:text-5xl")}
          >
            {honoreeName}
          </motion.p>
          <motion.a
            {...rise(0.84)}
            href="#proposal-greeting"
            aria-label="Scroll down to the rest of the proposal"
            className="pointer-events-auto mt-7 inline-flex flex-col items-center gap-3 text-[#FFEFD6] transition-colors hover:text-[#FFFDF8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]"
          >
            <span className={proposalSmallCaps}>Continue</span>
            <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-[#FFFDF8]/55">
              {calm ? (
                <span className="absolute inset-x-0 top-0 block h-1/2 bg-[#DDBF8D]" />
              ) : (
                <motion.span
                  className="absolute inset-x-0 top-0 block h-1/2 bg-[#DDBF8D]"
                  animate={{ y: ["-100%", "220%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease }}
                />
              )}
            </span>
          </motion.a>
        </div>
      </section>

      <div className="relative" style={{ backgroundImage: pageParchment }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,rgba(221,191,141,0.28),transparent_72%)]"
        />

        <section
          id="proposal-greeting"
          className="relative mx-auto max-w-3xl scroll-mt-8 px-6 pb-2 pt-20 text-center sm:pt-28"
        >
          <motion.div {...arrive(0)}>
            <Fleuron className="mx-auto" />
          </motion.div>
          <motion.p {...arrive(0.08)} className={cn(proposalSmallCaps, "mt-6", ink.accent)}>
            Dear
          </motion.p>
          <motion.h1
            {...arrive(0.16)}
            className={cn(
              displayFont,
              "mt-5 text-balance text-[clamp(3.2rem,8vw,5.5rem)] font-normal leading-[0.95]",
              ink.heading,
            )}
          >
            {honoreeName}
          </motion.h1>
          <motion.p
            {...arrive(0.28)}
            className={cn(scriptFont, "mt-5 text-4xl sm:text-5xl", ink.accent)}
          >
            {coupleNames}
          </motion.p>
          <motion.p
            {...arrive(0.38)}
            className={cn(
              displayFont,
              "mx-auto mt-4 max-w-md text-balance text-2xl font-normal italic leading-snug sm:text-3xl",
              ink.secondary,
            )}
          >
            Will you be {rolePhrase}?
          </motion.p>
          <motion.div {...arrive(0.48)} className="mt-12">
            <GoldDivider />
          </motion.div>
        </section>

        <section
          id="wedding-details"
          className="relative mx-auto max-w-4xl px-6 pb-20 pt-10 sm:pb-28 sm:pt-12"
        >
          <dl className="grid gap-8 divide-y divide-[#DDBF8D]/55 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-y-0">
            <Detail label="The date" value={dateLabel ?? "To be announced"} calm={calm} delay={0} />
            <Detail
              label="Ceremony"
              value={timeLabel ?? "To be announced"}
              calm={calm}
              delay={0.1}
            />
            <Detail
              label="The venue"
              value={venueName ?? "Fernwood Gardens, Tagaytay"}
              calm={calm}
              delay={0.2}
            />
          </dl>
        </section>

        <section className="relative mx-auto max-w-5xl px-5 pb-16 sm:px-6 sm:pb-24">
          <ChapterIntro
            calm={calm}
            kicker="Save the date"
            title="Our invitation film"
            note="A little glimpse of the day we cannot wait to celebrate with you."
          />
          <motion.div
            className="overflow-hidden border border-[#DDBF8D]/70 bg-[#fffaf3] p-1.5 shadow-[0_30px_80px_-48px_rgba(74,50,54,0.55)] sm:p-2"
            initial={calm ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="relative bg-[#1c1619]">
              <video
                ref={videoRef}
                className="block h-auto w-full"
                width={1920}
                height={1080}
                controls={videoPlaying}
                playsInline
                preload="metadata"
                poster={SAVE_THE_DATE_POSTER_SRC}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
              >
                <source src={SAVE_THE_DATE_VIDEO_SRC} type="video/mp4" />
                Your browser does not support this video.
              </video>
              {!videoPlaying && (
                <button
                  type="button"
                  onClick={() => void playInvitationFilm()}
                  aria-label="Play invitation film"
                  className="absolute inset-0 z-10 flex items-center justify-center bg-[#1c1619]/35 transition hover:bg-[#1c1619]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DDBF8D]"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#DDBF8D] bg-[#1a1214]/75 text-[#FFEFD6] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-sm sm:h-24 sm:w-24">
                    <Play className="h-8 w-8 translate-x-0.5 fill-current sm:h-9 sm:w-9" />
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </section>

        <section className="relative overflow-hidden pb-16 sm:pb-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <ChapterIntro
              calm={calm}
              kicker="Our photographs"
              title="Moments with us"
              note="Drag a row to find a moment — tap to open. Swipe stays in that row."
            />
          </div>
          <ProposalPhotoRows calm={calm} compact={compactGallery} />
          <p className={cn(proposalSmallCaps, "relative z-10 mt-5 text-center sm:mt-6", ink.muted)}>
            Drag to find · Tap to open · Swipe stays in that row
          </p>
        </section>

        <section className="relative mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12">
          <motion.div
            className="relative border border-[#C9A66B] bg-[#FFFDF8] px-8 py-14 text-center sm:px-16 sm:py-16"
            initial={calm ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease }}
          >
            <GoldCorner className="left-2 top-2" />
            <GoldCorner className="right-2 top-2 rotate-90" />
            <GoldCorner className="bottom-2 left-2 -rotate-90" />
            <GoldCorner className="bottom-2 right-2 rotate-180" />
            <Fleuron className="mx-auto" />
            <p
              className={cn(
                displayFont,
                "mt-8 whitespace-pre-line text-2xl font-normal italic leading-relaxed sm:text-[2rem] sm:leading-relaxed",
                ink.body,
              )}
            >
              {message}
            </p>
          </motion.div>
        </section>

        <section className="relative mx-auto max-w-xl px-5 pb-6 pt-4 sm:px-6">{children}</section>

        <footer className="relative mx-auto flex max-w-xl flex-col items-center px-6 pb-16 pt-8 text-center">
          <span
            aria-hidden
            className="mb-5 h-12 w-px bg-gradient-to-b from-transparent to-[#DDBF8D]"
          />
          <p className={cn(scriptFont, "text-4xl", ink.footer)}>{coupleNames}</p>
          {dateLabel && <p className={cn(proposalSmallCaps, "mt-4", ink.muted)}>{dateLabel}</p>}
        </footer>
      </div>
    </main>
  );
}

function ProposalGalleryLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const onCloseRef = React.useRef(onClose);
  const onIndexChangeRef = React.useRef(onIndexChange);
  const indexRef = React.useRef(index);
  const [direction, setDirection] = React.useState(0);

  onCloseRef.current = onClose;
  onIndexChangeRef.current = onIndexChange;
  indexRef.current = index;

  const item = images[index];
  const count = images.length;

  const goTo = React.useCallback(
    (nextIndex: number, dir: number) => {
      setDirection(dir);
      onIndexChangeRef.current(wrapIndex(nextIndex, count));
    },
    [count],
  );

  const goPrev = React.useCallback(() => goTo(indexRef.current - 1, -1), [goTo]);
  const goNext = React.useCallback(() => goTo(indexRef.current + 1, 1), [goTo]);

  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goPrev, goNext]);

  React.useEffect(() => {
    if (count < 2) return;
    const neighbors = [images[wrapIndex(index - 1, count)], images[wrapIndex(index + 1, count)]];
    for (const neighbor of neighbors) {
      if (!neighbor) continue;
      const img = new window.Image();
      img.src = neighbor.src;
    }
  }, [images, index, count]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) {
      goNext();
      return;
    }
    if (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY) {
      goPrev();
    }
  };

  if (!item) return null;

  const slideVariants = {
    enter: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? 72 : -72,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? -56 : 56,
      opacity: 0,
    }),
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex touch-none items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || "Photograph gallery"}
      onClick={onClose}
      onPointerUp={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[#120814]/72 backdrop-blur-2xl backdrop-saturate-150"
        onClick={onClose}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#120814]/45 via-transparent to-[#120814]/55"
      />

      <button
        ref={closeRef}
        type="button"
        className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 sm:top-5"
        aria-label="Close photo"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4 sm:grid"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4 sm:grid"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div
        className="relative z-10 flex h-full w-full max-w-[min(96vw,1400px)] flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.figure
            key={item.src}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: reduceMotion ? 0.01 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            className="relative flex max-h-full w-full cursor-grab flex-col items-center gap-3 active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- fullscreen HD source, not a layout image */}
            <img
              src={item.src}
              alt={item.caption || "Wedding photograph"}
              decoding="async"
              className="max-h-[min(84dvh,920px)] max-w-full select-none object-contain"
              style={{
                width: "auto",
                height: "auto",
                imageRendering: "auto",
                touchAction: "none",
              }}
              draggable={false}
            />
            <figcaption className="flex max-w-[min(90vw,36rem)] flex-col items-center gap-1.5 text-center">
              {item.caption ? (
                <span className={cn(proposalSmallCaps, "text-[#FFFDF8]")}>{item.caption}</span>
              ) : null}
              <span className={cn(proposalSmallCaps, "text-[#FFEFD6]")}>
                {index + 1} / {count}
                {count > 1 ? " · swipe for more" : null}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );
}

function ProposalGallerySlide({
  image,
  size,
  onOpen,
}: {
  image: GalleryImage;
  size: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative shrink-0 overflow-hidden border border-[#DDBF8D]/45 bg-[#1c1619] text-left shadow-[0_16px_36px_-24px_rgba(74,50,54,0.55)] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF8]"
      style={{ width: size, height: Math.round(size * (2 / 3)) }}
      aria-label={`View ${image.caption}`}
    >
      <Image
        src={image.src}
        alt={image.caption}
        width={1920}
        height={1280}
        sizes={`${size}px`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        draggable={false}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1c1619]/75 to-transparent px-2.5 pb-2 pt-8 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className={cn(proposalSmallCaps, "block truncate text-[11px] text-[#FFFDF8]")}>
          {image.caption}
        </span>
      </span>
    </button>
  );
}

type GalleryRow = {
  id: string;
  images: GalleryImage[];
  reverse?: boolean;
  duration: number;
};

type LightboxState = {
  rowId: string;
  images: GalleryImage[];
  index: number;
};

function ProposalPhotoRows({
  calm,
  compact,
}: {
  calm: boolean;
  compact: boolean;
}) {
  const cardSize = compact ? 168 : 220;
  const gap = compact ? 12 : 16;
  const rows: GalleryRow[] = gallerySets.map((set, index) => ({
    id: set.id,
    images: set.images,
    reverse: index % 2 === 1,
    duration: Math.round(set.images.length * 10) + index * 8,
  }));
  const [lightbox, setLightbox] = React.useState<LightboxState | null>(null);

  const openPhoto = React.useCallback((row: GalleryRow, image: GalleryImage) => {
    const found = row.images.findIndex((photo) => photo.src === image.src);
    setLightbox({
      rowId: row.id,
      images: row.images,
      index: found >= 0 ? found : 0,
    });
  }, []);

  return (
    <>
      <div className="relative z-10 mt-8 w-full sm:mt-10" aria-label="Photo gallery">
        <div className="flex flex-col justify-center gap-3 sm:gap-4">
          {rows.map((row) => (
            <InfiniteSlider
              key={row.id}
              direction="horizontal"
              reverse={row.reverse}
              gap={gap}
              duration={calm ? 120 : row.duration}
              durationOnHover={calm ? undefined : row.duration * 2.4}
              draggable
              className="w-full"
            >
              {row.images.map((image) => (
                <ProposalGallerySlide
                  key={`${row.id}-${image.src}`}
                  image={image}
                  size={cardSize}
                  onOpen={() => openPhoto(row, image)}
                />
              ))}
            </InfiniteSlider>
          ))}
        </div>
      </div>
      {lightbox ? (
        <ProposalGalleryLightbox
          images={lightbox.images}
          index={lightbox.index}
          onIndexChange={(next) => setLightbox((current) => (current ? { ...current, index: next } : current))}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);

  useIsoLayoutEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return reduce;
}

function LightMotes({ paused }: { paused: boolean }) {
  if (paused) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {lightMotes.map((mote) => (
        <motion.span
          key={mote.left}
          className="absolute bottom-0 rounded-full bg-[#F6E7C1]"
          style={{
            left: mote.left,
            width: mote.size,
            height: mote.size,
            boxShadow: "0 0 10px 2px rgba(243,230,200,0.65)",
          }}
          initial={{ y: "18vh", opacity: 0 }}
          animate={{
            y: "-110vh",
            x: [0, mote.drift, 0],
            opacity: [0, 0.85, 0.7, 0],
          }}
          transition={{
            y: { duration: mote.duration, delay: mote.delay, repeat: Infinity, ease: "linear" },
            x: { duration: mote.duration, delay: mote.delay, repeat: Infinity, ease: "easeInOut" },
            opacity: {
              duration: mote.duration,
              delay: mote.delay,
              repeat: Infinity,
              times: [0, 0.12, 0.72, 1],
            },
          }}
        />
      ))}
    </div>
  );
}

function CinematicFrame({
  photo,
  active,
  opened,
  reduceMotion,
  fadeIn,
  priority,
}: {
  photo: ProposalImage;
  active: boolean;
  opened: boolean;
  reduceMotion: boolean;
  fadeIn: boolean;
  priority?: boolean;
}) {
  const playing = active && opened && !reduceMotion;
  const [scale, setScale] = React.useState(1.04);

  React.useEffect(() => {
    if (reduceMotion) return;
    if (playing) {
      setScale(1.04);
      const start = window.setTimeout(() => setScale(1.1), 40);
      return () => window.clearTimeout(start);
    }
    const reset = window.setTimeout(() => setScale(1.04), 1700);
    return () => window.clearTimeout(reset);
  }, [playing, reduceMotion]);

  return (
    <motion.div
      className="absolute inset-0"
      initial={fadeIn ? { opacity: 0 } : false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 1.6, ease }}
      aria-hidden={!active}
    >
      <motion.div
        className="absolute inset-[-8%]"
        initial={{ scale: reduceMotion ? 1 : 1.04 }}
        animate={{ scale: reduceMotion ? 1 : scale }}
        transition={{ duration: playing && scale === 1.1 ? HERO_ROTATE_MS / 1000 : 0, ease: "linear" }}
      >
        <Image
          src={photo.url}
          alt={active ? photo.caption || photo.fileName : ""}
          fill
          priority={priority}
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

function ChapterIntro({
  kicker,
  title,
  note,
  calm,
}: {
  kicker: string;
  title: string;
  note?: string;
  calm: boolean;
}) {
  const rise = calm
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.6 },
        transition: { duration: 0.85, ease },
      };

  return (
    <div className="mx-auto mb-8 max-w-xl text-center sm:mb-12">
      <motion.div {...rise}>
        <Fleuron className="mx-auto" />
      </motion.div>
      <motion.p {...rise} className={cn(proposalSmallCaps, "mt-5", ink.accent)}>
        {kicker}
      </motion.p>
      <motion.h2
        {...rise}
        className={cn(
          displayFont,
          "mt-3 text-balance text-4xl font-normal leading-tight sm:text-5xl",
          ink.heading,
        )}
      >
        {title}
      </motion.h2>
      {note && (
        <motion.p
          {...rise}
          className={cn(displayFont, "mt-3 text-lg font-normal italic leading-relaxed", ink.secondary)}
        >
          {note}
        </motion.p>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  note,
  calm,
  delay,
}: {
  label: string;
  value: string;
  note?: string | null;
  calm: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="px-4 py-2 text-center sm:px-8 sm:py-1"
      initial={calm ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.75, delay: calm ? 0 : delay, ease }}
    >
      <dt className={cn(proposalSmallCaps, ink.muted)}>{label}</dt>
      <dd
        className={cn(
          displayFont,
          "mt-3 text-balance text-2xl font-normal leading-snug sm:text-3xl",
          ink.heading,
        )}
      >
        {value}
      </dd>
      {note && (
        <dd className={cn("mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed", ink.secondary)}>
          {note}
        </dd>
      )}
    </motion.div>
  );
}
