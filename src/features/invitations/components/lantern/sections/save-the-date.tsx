"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Maximize2, Minimize2, Play } from "lucide-react";

import { SAVE_THE_DATE_VIDEO } from "../media";
import { MagicDust } from "../effects/magic-dust";
import { useExperience } from "../experience/experience-provider";
import { useLanternPerf } from "../performance/lantern-perf-provider";

const LUXURY = [0.16, 1, 0.3, 1] as const;

type VideoWithWebkit = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

function getFullscreenElement() {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/**
 * Save-the-date film after the quote — exact viewport height, full-bleed 2K 16:9.
 */
export function SaveTheDate() {
  const reduceMotion = useReducedMotion();
  const { setAmbientSuspended } = useExperience();
  const { compact } = useLanternPerf();
  const videoSrc = compact
    ? SAVE_THE_DATE_VIDEO.mobileSrc
    : SAVE_THE_DATE_VIDEO.src;
  const videoWidth = compact
    ? SAVE_THE_DATE_VIDEO.mobileWidth
    : SAVE_THE_DATE_VIDEO.width;
  const videoHeight = compact
    ? SAVE_THE_DATE_VIDEO.mobileHeight
    : SAVE_THE_DATE_VIDEO.height;
  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [playing, setPlaying] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  // iOS/Safari often won't paint the first video frame until play — keep poster visible.
  const [showPoster, setShowPoster] = React.useState(true);

  React.useEffect(() => {
    const sync = () => {
      const video = videoRef.current as VideoWithWebkit | null;
      const stage = stageRef.current;
      const active = getFullscreenElement();
      const webkitFs = Boolean(video?.webkitDisplayingFullscreen);
      setFullscreen(
        webkitFs ||
          (active != null &&
            (active === stage || active === video || stage?.contains(active) === true)),
      );
    };

    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    const video = videoRef.current as VideoWithWebkit | null;
    video?.addEventListener("webkitbeginfullscreen", sync);
    video?.addEventListener("webkitendfullscreen", sync);
    sync();

    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      video?.removeEventListener("webkitbeginfullscreen", sync);
      video?.removeEventListener("webkitendfullscreen", sync);
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || fullscreen) return;
    if (!inView && !video.paused) {
      video.pause();
      setPlaying(false);
      setAmbientSuspended(false);
    }
  }, [inView, fullscreen, setAmbientSuspended]);

  React.useEffect(() => {
    return () => setAmbientSuspended(false);
  }, [setAmbientSuspended]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        video.muted = false;
        await video.play();
        setPlaying(true);
        setAmbientSuspended(true);
      } catch {
        video.muted = true;
        await video.play();
        setPlaying(true);
        setAmbientSuspended(true);
      }
    } else {
      video.pause();
      setPlaying(false);
      setAmbientSuspended(false);
    }
  }

  function handleVideoPlay() {
    setShowPoster(false);
    setPlaying(true);
    setAmbientSuspended(true);
  }

  function handleVideoPause() {
    setPlaying(false);
    setAmbientSuspended(false);
  }

  function handleVideoEnded() {
    setPlaying(false);
    setShowPoster(true);
    setAmbientSuspended(false);
  }

  async function toggleFullscreen() {
    const stage = stageRef.current;
    const video = videoRef.current as VideoWithWebkit | null;
    if (!stage || !video) return;

    try {
      if (fullscreen) {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void> | void;
        };
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        setFullscreen(false);
        return;
      }

      if (stage.requestFullscreen) {
        await stage.requestFullscreen();
        setFullscreen(true);
        return;
      }

      const stageWebkit = stage as HTMLDivElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      if (stageWebkit.webkitRequestFullscreen) {
        await stageWebkit.webkitRequestFullscreen();
        setFullscreen(true);
        return;
      }

      // iOS Safari: fullscreen the video element itself
      if (typeof video.webkitEnterFullscreen === "function") {
        video.webkitEnterFullscreen();
        setFullscreen(true);
      }
    } catch {
      // Fullscreen can be blocked without a user gesture or on restricted browsers.
    }
  }

  return (
    <section
      id="film"
      ref={sectionRef}
      className="relative flex h-[100vh] h-[100svh] h-[100dvh] w-full max-w-[100vw] shrink-0 flex-col overflow-hidden bg-night"
      style={{
        background:
          "linear-gradient(180deg, #0d0720 0%, #160b2e 45%, #0d0720 100%)",
      }}
    >
      <MagicDust count={14} intensity="soft" className="opacity-40" />

      <div className="relative z-10 flex shrink-0 flex-col items-center px-4 pt-[max(1.5rem,env(safe-area-inset-top))] text-center sm:px-6 sm:pt-8">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: LUXURY }}
          className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.4em] text-lantern-rose/90"
        >
          Save the Date
        </motion.span>

        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.06 }}
          className="mt-3 font-display text-[1.85rem] font-light leading-[1.1] tracking-[-0.02em] text-lantern sm:mt-4 sm:text-4xl lg:text-5xl"
        >
          A short film for our forever
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.1 }}
          className="mt-2 max-w-xl font-serif text-sm italic text-cream/80 sm:mt-3 sm:text-base"
        >
          Press play and step into the beginning of our happily ever after.
        </motion.p>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: LUXURY, delay: 0.12 }}
        className="relative z-10 mx-auto mt-4 flex min-h-0 w-full flex-1 items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:mt-6 sm:px-6 lg:px-10"
      >
        {/*
          Keep the stage 16:9 so the film fills the frame. A tall full-bleed stage
          + object-contain letterboxes oddly on iOS (thumbnail stuck to the bottom).
        */}
        <div
          ref={stageRef}
          className="relative aspect-video w-full max-h-full overflow-hidden rounded-lg bg-night shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)]"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            src={videoSrc}
            poster={SAVE_THE_DATE_VIDEO.posterSrc}
            playsInline
            preload="metadata"
            controls={false}
            width={videoWidth}
            height={videoHeight}
            onEnded={handleVideoEnded}
            onPause={handleVideoPause}
            onPlay={handleVideoPlay}
          >
            <track kind="captions" />
          </video>

          {showPoster && !playing ? (
            <Image
              src={SAVE_THE_DATE_VIDEO.posterSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="pointer-events-none absolute inset-0 z-[1] object-cover object-center"
              priority={compact}
              unoptimized
            />
          ) : null}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-night/40 via-transparent to-night/15"
          />

          <button
            type="button"
            onClick={togglePlayback}
            aria-label={
              playing ? "Pause save the date video" : "Play save the date video"
            }
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            {!playing && (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-lantern/60 bg-night/70 text-lantern shadow-[0_0_40px_rgba(244,196,68,0.35)] backdrop-blur-md sm:h-20 sm:w-20">
                <Play className="h-7 w-7 translate-x-0.5 fill-current" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void toggleFullscreen();
            }}
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-lantern/45 bg-night/70 text-lantern backdrop-blur-md transition hover:border-lantern/70 hover:bg-night/85 sm:bottom-4 sm:right-4 sm:h-11 sm:w-11"
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
