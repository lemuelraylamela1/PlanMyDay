"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock3, MapPin, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Fleuron,
  displayFont,
  scriptFont,
  smallCaps,
} from "@/features/invitations/components/fairytale/ornaments";
import { grainOverlay } from "@/features/invitations/components/fairytale/textures";

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

  const reveal = calm
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

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

      <section className="bg-[#FFFDF8]">
        <div
          id="proposal-greeting"
          className="mx-auto max-w-3xl scroll-mt-8 px-6 pb-8 pt-8 text-center sm:pb-10 sm:pt-10"
        >
          <motion.p
            {...reveal}
            transition={{ duration: 0.8, ease }}
            className="text-sm font-medium uppercase tracking-[0.32em] text-[#B76E79]"
          >
            Dear
          </motion.p>
          <motion.h1
            {...reveal}
            transition={{ duration: 0.9, delay: calm ? 0 : 0.1, ease }}
            className="mt-4 font-serif text-4xl font-medium leading-tight text-[#6d4650] sm:text-6xl"
          >
            {honoreeName}
          </motion.h1>
          <motion.p
            {...reveal}
            transition={{ duration: 0.9, delay: calm ? 0 : 0.2, ease }}
            className="mt-6 font-serif text-3xl text-[#B76E79] sm:text-4xl"
          >
            {coupleNames}
          </motion.p>
          <motion.p
            {...reveal}
            transition={{ duration: 0.9, delay: calm ? 0 : 0.28, ease }}
            className="mt-3 font-serif text-xl italic text-[#8d5d66] sm:text-2xl"
          >
            Will you be {rolePhrase}?
          </motion.p>
        </div>
      </section>

      <section id="wedding-details" className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-24">
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: calm ? 0 : 0.12 } },
          }}
        >
          <DetailCard icon={CalendarDays} label="Date" value={dateLabel ?? "To be announced"} />
          <DetailCard icon={Clock3} label="Ceremony" value={timeLabel ?? "To be announced"} />
          <DetailCard
            icon={MapPin}
            label="Venue"
            value={venueName ?? "To be announced"}
            detail={venueAddress}
          />
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-6 sm:pb-20">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B76E79]">Save the date</p>
          <h2 className="mt-3 font-serif text-3xl text-[#6d4650] sm:text-5xl">Our invitation film</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8d5d66]">
            A little glimpse of the day we cannot wait to celebrate with you.
          </p>
        </div>
        <motion.div
          className="overflow-hidden rounded-[2rem] border border-[#E8B8C7]/80 bg-[#FFFDF8] p-1.5 shadow-[0_24px_70px_rgba(183,110,121,0.16)] sm:p-2"
          initial={calm ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <video
            ref={videoRef}
            className="block h-auto w-full rounded-[1.6rem]"
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

      <section className="mx-auto max-w-6xl px-3 pb-10 sm:px-6 sm:pb-16">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B76E79]">Our photographs</p>
          <h2 className="mt-3 font-serif text-3xl text-[#6d4650] sm:text-5xl">Nine moments with us</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8d5d66]">
            Tap a photograph to bring it into the opening scene.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
          {galleryPhotos.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => showPhoto(index)}
              className={`group relative overflow-hidden rounded-xl text-left shadow-sm ring-1 ring-[#E8B8C7]/70 sm:rounded-2xl ${
                index === active ? "ring-2 ring-[#B76E79]" : ""
              }`}
              initial={calm ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: calm ? 0 : index * 0.08 }}
              aria-label={`Show ${photo.caption || photo.fileName} in the hero`}
              aria-current={index === active ? "true" : undefined}
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={photo.url}
                  alt={photo.caption || photo.fileName}
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
              </div>
              {photo.caption && (
                <p className="absolute inset-x-0 bottom-0 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:py-3 sm:text-sm">
                  {photo.caption}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 sm:py-24">
        <motion.div
          initial={calm ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mx-auto mb-8 h-px w-16 bg-[#DDBF8D]" />
          <p className="whitespace-pre-line font-serif text-2xl leading-relaxed text-[#6d4650] sm:text-3xl sm:leading-relaxed">
            {message}
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-6">{children}</section>
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

function DetailCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string | null;
}) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
      }}
      className="rounded-2xl border border-[#E8B8C7] bg-white/70 px-6 py-7 text-center shadow-sm"
    >
      <Icon className="mx-auto h-5 w-5 text-[#DDBF8D]" />
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[#B76E79]">{label}</p>
      <p className="mt-2 font-serif text-2xl text-[#6d4650]">{value}</p>
      {detail && <p className="mt-2 text-sm leading-6 text-[#8d5d66]">{detail}</p>}
    </motion.article>
  );
}
