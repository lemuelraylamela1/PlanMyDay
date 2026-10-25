"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

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

const PROPOSAL_MUSIC_SRC = "/proposal-audio/marry-me.mp3";
const SAVE_THE_DATE_VIDEO_SRC = "/proposal-video/save-the-date.mp4";

export interface ProposalImage {
  id: string;
  url: string;
  fileName: string;
  caption: string | null;
}

export const proposalHeroImages: ProposalImage[] = [
  { id: "hero-01", url: "/proposal-photos/hero-01.jpg", fileName: "By the carriage", caption: "By the carriage" },
  { id: "hero-02", url: "/proposal-photos/hero-02.jpg", fileName: "At Fernwood", caption: "At Fernwood" },
  { id: "hero-03", url: "/proposal-photos/hero-03.jpg", fileName: "Hand in hand", caption: "Hand in hand" },
  { id: "hero-04", url: "/proposal-photos/hero-04.jpg", fileName: "Our carriage", caption: "Our carriage" },
  { id: "hero-05", url: "/proposal-photos/hero-05.jpg", fileName: "A look back", caption: "A look back" },
  { id: "hero-06", url: "/proposal-photos/hero-06.jpg", fileName: "By the fountain", caption: "By the fountain" },
  { id: "hero-07", url: "/proposal-photos/hero-07.jpg", fileName: "A quiet moment", caption: "A quiet moment" },
  { id: "hero-08", url: "/proposal-photos/hero-08.jpg", fileName: "Stepping out", caption: "Stepping out" },
  { id: "hero-09", url: "/proposal-photos/hero-09.jpg", fileName: "Together", caption: "Together" },
];

const useIsoLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const ease = [0.22, 1, 0.36, 1] as const;

const gallerySpans = [
  "col-span-2 row-span-2 md:col-span-2",
  "col-span-1 md:col-span-2",
  "col-span-1 md:col-span-2",
  "col-span-1",
  "col-span-1",
  "col-span-2 md:col-span-2",
  "col-span-1",
  "col-span-1",
  "col-span-2 md:col-span-2",
];

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
  venueAddress,
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
  venueAddress: string | null;
  children: React.ReactNode;
}) {
  const calm = usePrefersReducedMotion();
  const [active, setActive] = React.useState(0);
  const [outgoing, setOutgoing] = React.useState<number | null>(null);
  const [opened, setOpened] = React.useState(false);
  const [musicPlaying, setMusicPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const musicPausedByVideoRef = React.useRef(false);
  const activeRef = React.useRef(0);
  const photos = [...proposalHeroImages, ...images];
  const galleryPhotos = photos.slice(0, 9);
  const cover = photos[0];

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
      showPhoto((activeRef.current + 1) % photos.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [opened, photos.length, calm, showPhoto]);

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

    void audio.play().then(() => {
      setMusicPlaying(true);
      setOpened(true);
    }).catch(() => {
      // Browsers often block sound until the guest taps Open.
    });

    return () => {
      audio.pause();
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!opened || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const audio = audioRef.current;
          musicPausedByVideoRef.current = Boolean(audio && !audio.paused);
          if (audio && !audio.paused) {
            audio.pause();
            setMusicPlaying(false);
          }
          video.muted = true;
          void video.play().catch(() => undefined);
          return;
        }

        video.pause();
        if (musicPausedByVideoRef.current) {
          musicPausedByVideoRef.current = false;
          void startMusic();
        }
      },
      { threshold: 0.55 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [opened]);

  async function openInvitation() {
    await startMusic();
    setOpened(true);
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      videoRef.current?.pause();
      musicPausedByVideoRef.current = false;
      await startMusic();
      return;
    }
    audio.pause();
    setMusicPlaying(false);
  }

  function handleVideoPlay() {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    musicPausedByVideoRef.current = true;
    audio.pause();
    setMusicPlaying(false);
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
    <main className="bg-[#FFFDF8] text-[#5c3d43]">
      <audio
        ref={audioRef}
        src={PROPOSAL_MUSIC_SRC}
        preload="auto"
        autoPlay
        loop
        playsInline
      />
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
              className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center text-[#FFFDF8]"
              aria-label="Open invitation and play music"
            >
              <motion.span
                className="flex flex-col items-center"
                initial={calm ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease, delay: 0.12 }}
              >
                <Fleuron className="text-[#DDBF8D]" />
                <p className={cn(smallCaps, "mt-6 text-[#DDBF8D]")}>A special invitation</p>
                <p
                  className={cn(
                    displayFont,
                    "mt-5 max-w-3xl text-balance text-[2.7rem] font-light leading-[0.98] sm:text-7xl",
                  )}
                >
                  {coupleNames}
                </p>
                <p className={cn(scriptFont, "mt-4 text-4xl text-[#F3E6C8] sm:text-5xl")}>
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
                  <span className="flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full border border-[#DDBF8D]/80 bg-[#1a1214]/40 text-[#F6E7C1] backdrop-blur-[2px]">
                    <Volume2 className="h-5 w-5" />
                  </span>
                </motion.span>
                <span className={cn(smallCaps, "mt-5 text-[#DDBF8D]")}>Tap to open</span>
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
          className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#E8B8C7] bg-[#FFFDF8]/95 text-[#B76E79] shadow-md backdrop-blur-sm"
        >
          {musicPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}
      <section
        className="relative h-svh overflow-hidden bg-[#1c1619]"
        inert={!opened}
      >
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
        {photos.length > 1 && (
          <div
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex max-w-[68%] flex-wrap justify-end sm:right-8"
            role="tablist"
            aria-label="Wedding portraits"
          >
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={`Show ${photo.caption || photo.fileName}`}
                onClick={() => showPhoto(index)}
                className="relative h-7 w-7 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]"
              >
                <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/80 shadow-[0_0_6px_rgba(0,0,0,0.7)]" />
                <motion.span
                  className="absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-1/2 bg-[#DDBF8D] shadow-[0_0_6px_rgba(0,0,0,0.7)]"
                  initial={false}
                  animate={{ width: active === index ? 16 : 0 }}
                  transition={{ duration: calm ? 0 : 0.65, ease }}
                />
              </button>
            ))}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-[max(1.35rem,env(safe-area-inset-bottom))] text-center text-[#FFFDF8]">
          {dateLabel && (
            <motion.p {...rise(0.28)} className={cn(smallCaps, "text-[#DDBF8D]")}>
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
            className="mt-4 max-w-md text-balance font-serif text-lg italic leading-snug text-[#FFFDF8]/86 sm:text-2xl"
          >
            Will you be {rolePhrase}?
          </motion.p>
          <motion.p {...rise(0.7)} className={cn(scriptFont, "mt-3 text-4xl text-[#F3E6C8] sm:text-5xl")}>
            {honoreeName}
          </motion.p>
          <motion.a
            {...rise(0.84)}
            href="#proposal-greeting"
            aria-label="Scroll down to the rest of the proposal"
            className="pointer-events-auto mt-7 inline-flex flex-col items-center gap-3 text-[#FFFDF8]/75 transition-colors hover:text-[#DDBF8D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]"
          >
            <span className={smallCaps}>Continue</span>
            <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-[#FFFDF8]/35">
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
          <motion.p {...arrive(0.08)} className={cn(smallCaps, "mt-6 text-[#B76E79]")}>
            Dear
          </motion.p>
          <motion.h1
            {...arrive(0.16)}
            className={cn(
              displayFont,
              "mt-5 text-balance text-[clamp(3.2rem,8vw,5.5rem)] font-light leading-[0.95] text-[#4a3236]",
            )}
          >
            {honoreeName}
          </motion.h1>
          <motion.p {...arrive(0.28)} className={cn(scriptFont, "mt-5 text-4xl text-[#B76E79] sm:text-5xl")}>
            {coupleNames}
          </motion.p>
          <motion.p
            {...arrive(0.38)}
            className={cn(
              displayFont,
              "mx-auto mt-4 max-w-md text-balance text-2xl font-light italic leading-snug text-[#6d4a50] sm:text-3xl",
            )}
          >
            Will you be {rolePhrase}?
          </motion.p>
          <motion.div {...arrive(0.48)} className="mt-12">
            <GoldDivider />
          </motion.div>
        </section>

        <section id="wedding-details" className="relative mx-auto max-w-4xl px-6 pb-20 pt-10 sm:pb-28 sm:pt-12">
          <dl className="grid gap-8 divide-y divide-[#DDBF8D]/55 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-y-0">
            <Detail
              label="The date"
              value={dateLabel ?? "To be announced"}
              calm={calm}
              delay={0}
            />
            <Detail
              label="Ceremony"
              value={timeLabel ?? "To be announced"}
              calm={calm}
              delay={0.1}
            />
            <Detail
              label="The venue"
              value={venueName ?? "To be announced"}
              note={venueAddress}
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
            <video
            ref={videoRef}
            className="block h-auto w-full"
            width={1920}
            height={1080}
            controls
            muted
            playsInline
            preload="metadata"
            poster="/proposal-photos/hero-02.jpg"
            onPlay={handleVideoPlay}
          >
            <source src={SAVE_THE_DATE_VIDEO_SRC} type="video/mp4" />
            Your browser does not support this video.
          </video>
        </motion.div>
      </section>

        <section className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
          <ChapterIntro
            calm={calm}
            kicker="Our photographs"
            title="Nine moments with us"
            note="Tap a photograph to bring it into the opening scene."
          />
          <div className="grid grid-flow-dense grid-cols-2 auto-rows-[8.75rem] gap-2 sm:auto-rows-[11rem] sm:gap-3 md:grid-cols-4 md:auto-rows-[12.5rem]">
            {galleryPhotos.map((photo, index) => (
              <motion.button
                key={photo.id}
                type="button"
                onClick={() => showPhoto(index)}
                className={cn(
                  "group relative min-h-0 overflow-hidden bg-[#1c1619] text-left shadow-[0_16px_36px_-24px_rgba(74,50,54,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF6EE]",
                  gallerySpans[index] ?? "col-span-1",
                  index === active && "ring-2 ring-[#C9A66B] ring-offset-2 ring-offset-[#FBF6EE]",
                )}
                initial={calm ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: calm ? 0 : (index % 4) * 0.06, ease }}
                aria-label={`Show ${photo.caption || photo.fileName} in the hero`}
                aria-current={index === active ? "true" : undefined}
              >
                <div className="absolute inset-0">
                  <Image
                    src={photo.url}
                    alt={photo.caption || photo.fileName}
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 40vw, 50vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1619]/70 via-transparent to-transparent" />
                </div>
                {photo.caption && (
                  <p className={cn(displayFont, "absolute inset-x-0 bottom-0 px-3 py-3 text-sm italic text-[#FFFDF8] sm:px-4 sm:text-base")}>
                    {photo.caption}
                  </p>
                )}
            </motion.button>
          ))}
        </div>
      </section>

        <section className="relative mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12">
          <motion.div
            className="relative border border-[#DDBF8D]/50 bg-[#FFFDF8]/60 px-8 py-14 text-center sm:px-16 sm:py-16"
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
                "mt-8 whitespace-pre-line text-2xl font-light italic leading-relaxed text-[#4a3236] sm:text-[2rem] sm:leading-relaxed",
              )}
            >
              {message}
            </p>
          </motion.div>
        </section>

        <section className="relative mx-auto max-w-xl px-5 pb-6 pt-4 sm:px-6">{children}</section>

        <footer className="relative mx-auto flex max-w-xl flex-col items-center px-6 pb-16 pt-8 text-center">
          <span aria-hidden className="mb-5 h-12 w-px bg-gradient-to-b from-transparent to-[#DDBF8D]" />
          <p className={cn(scriptFont, "text-4xl text-[#C9A66B]")}>{coupleNames}</p>
          {dateLabel && <p className={cn(smallCaps, "mt-4 text-[#9b7b62]")}>{dateLabel}</p>}
        </footer>
      </div>
    </main>
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
        transition={{ duration: playing && scale === 1.1 ? 7 : 0, ease: "linear" }}
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
      <motion.p {...rise} className={cn(smallCaps, "mt-5 text-[#B76E79]")}>
        {kicker}
      </motion.p>
      <motion.h2
        {...rise}
        className={cn(displayFont, "mt-3 text-balance text-4xl font-light leading-tight text-[#4a3236] sm:text-5xl")}
      >
        {title}
      </motion.h2>
      {note && (
        <motion.p {...rise} className={cn(displayFont, "mt-3 text-lg italic leading-relaxed text-[#6d4a50]")}>
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
      <dt className={cn(smallCaps, "text-[#9b7b62]")}>{label}</dt>
      <dd className={cn(displayFont, "mt-3 text-balance text-2xl font-light leading-snug text-[#4a3236] sm:text-3xl")}>
        {value}
      </dd>
      {note && <dd className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#7a5d62]">{note}</dd>}
    </motion.div>
  );
}
