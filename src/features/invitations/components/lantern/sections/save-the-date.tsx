"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Maximize2, Minimize2, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { SAVE_THE_DATE_VIDEO } from "../media";
import { MagicDust } from "../effects/magic-dust";
import { useExperience } from "../experience/experience-provider";
import { useLanternPerf } from "../performance/lantern-perf-provider";
import { useIsMobile } from "../hooks/use-is-mobile";

const LUXURY = [0.16, 1, 0.3, 1] as const;
const CONTROLS_HIDE_MS = 3000;

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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Save-the-date film after the quote — exact viewport height, full-bleed 2K 16:9.
 */
export function SaveTheDate() {
  const reduceMotion = useReducedMotion();
  const { setAmbientSuspended } = useExperience();
  const { compact } = useLanternPerf();
  const isMobile = useIsMobile();
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
  const scrubberRef = React.useRef<HTMLDivElement>(null);
  const wasPlayingRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const hideControlsTimerRef = React.useRef<number | null>(null);
  const controlsVisibleRef = React.useRef(true);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [playing, setPlaying] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  // iOS/Safari often won't paint the first video frame until play — keep poster visible.
  const [showPoster, setShowPoster] = React.useState(true);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [scrubRatio, setScrubRatio] = React.useState(0);
  const [controlsVisible, setControlsVisible] = React.useState(true);

  const progressRatio = dragging
    ? scrubRatio
    : duration > 0
      ? Math.min(1, Math.max(0, currentTime / duration))
      : 0;

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

  const clearHideControlsTimer = React.useCallback(() => {
    if (hideControlsTimerRef.current != null) {
      window.clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
  }, []);

  const scheduleHideControls = React.useCallback(() => {
    clearHideControlsTimer();
    hideControlsTimerRef.current = window.setTimeout(() => {
      if (draggingRef.current) return;
      const video = videoRef.current;
      // Keep the line visible while paused so guests can scrub / replay.
      if (video?.paused) return;
      controlsVisibleRef.current = false;
      setControlsVisible(false);
    }, CONTROLS_HIDE_MS);
  }, [clearHideControlsTimer]);

  const revealControls = React.useCallback(() => {
    controlsVisibleRef.current = true;
    setControlsVisible(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  React.useEffect(() => {
    return () => clearHideControlsTimer();
  }, [clearHideControlsTimer]);

  // Restart the hide countdown whenever playback / scrubbing changes.
  React.useEffect(() => {
    if (dragging) {
      clearHideControlsTimer();
      controlsVisibleRef.current = true;
      setControlsVisible(true);
      return;
    }
    if (!playing) {
      clearHideControlsTimer();
      controlsVisibleRef.current = true;
      setControlsVisible(true);
      return;
    }
    scheduleHideControls();
  }, [playing, dragging, clearHideControlsTimer, scheduleHideControls]);

  function syncDuration() {
    const video = videoRef.current;
    if (!video) return;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
  }

  function seekToRatio(ratio: number) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const next = Math.min(1, Math.max(0, ratio)) * video.duration;
    video.currentTime = next;
    setCurrentTime(next);
    if (next > 0.05) setShowPoster(false);
  }

  function ratioFromPointer(clientX: number) {
    const track = scrubberRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }

  function beginScrub(clientX: number) {
    const video = videoRef.current;
    if (!video) return;
    revealControls();
    draggingRef.current = true;
    setDragging(true);
    wasPlayingRef.current = !video.paused && !video.ended;
    if (!video.paused) video.pause();
    const ratio = ratioFromPointer(clientX);
    setScrubRatio(ratio);
    seekToRatio(ratio);
  }

  function moveScrub(clientX: number) {
    if (!draggingRef.current) return;
    const ratio = ratioFromPointer(clientX);
    setScrubRatio(ratio);
    seekToRatio(ratio);
  }

  async function endScrub() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const video = videoRef.current;
    if (!video) return;
    if (wasPlayingRef.current && !video.ended) {
      try {
        await video.play();
        setPlaying(true);
        setAmbientSuspended(true);
      } catch {
        setPlaying(false);
        setAmbientSuspended(false);
      }
    }
  }

  React.useEffect(() => {
    if (!dragging) return;

    const onPointerMove = (event: PointerEvent) => {
      moveScrub(event.clientX);
    };
    const onPointerUp = () => {
      void endScrub();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scrub handlers read latest refs
  }, [dragging]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      if (video.ended || video.currentTime >= (video.duration || 0) - 0.05) {
        video.currentTime = 0;
        setCurrentTime(0);
      }
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
    if (draggingRef.current) return;
    setPlaying(false);
    setAmbientSuspended(false);
    const video = videoRef.current;
    // Near the start, restore the thumbnail so mobile doesn't sit on a blank frame.
    if (video && video.currentTime < 0.35) {
      setShowPoster(true);
    }
  }

  function handleVideoEnded() {
    setPlaying(false);
    setCurrentTime(duration || videoRef.current?.duration || 0);
    setShowPoster(true);
    setAmbientSuspended(false);
  }

  async function toggleFullscreen() {
    const stage = stageRef.current;
    const video = videoRef.current as VideoWithWebkit | null;
    if (!stage || !video) return;

    try {
      if (fullscreen || getFullscreenElement() || video.webkitDisplayingFullscreen) {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void> | void;
        };
        if (document.exitFullscreen && getFullscreenElement()) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen && getFullscreenElement()) {
          await doc.webkitExitFullscreen();
        }
        setFullscreen(false);
        return;
      }

      // iOS Safari only allows fullscreen on the <video> element.
      if (typeof video.webkitEnterFullscreen === "function") {
        video.webkitEnterFullscreen();
        setFullscreen(true);
        return;
      }

      if (typeof video.requestFullscreen === "function") {
        await video.requestFullscreen();
        setFullscreen(true);
        return;
      }

      if (typeof stage.requestFullscreen === "function") {
        await stage.requestFullscreen();
        setFullscreen(true);
        return;
      }

      const stageWebkit = stage as HTMLDivElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      if (typeof stageWebkit.webkitRequestFullscreen === "function") {
        await stageWebkit.webkitRequestFullscreen();
        setFullscreen(true);
      }
    } catch {
      // Fullscreen can be blocked without a user gesture or on restricted browsers.
    }
  }

  const displayTime = dragging
    ? (duration || 0) * scrubRatio
    : currentTime;

  return (
    <section
      id="film"
      ref={sectionRef}
      className="relative flex w-full max-w-[100vw] shrink-0 flex-col overflow-hidden bg-night sm:h-[100vh] sm:h-[100svh] sm:h-[100dvh]"
      style={{
        background:
          "linear-gradient(180deg, #0d0720 0%, #160b2e 45%, #0d0720 100%)",
      }}
    >
      <MagicDust count={14} intensity="soft" className="opacity-40" />

      <div className="relative z-10 flex shrink-0 flex-col items-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] text-center sm:px-6 sm:pt-8">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: LUXURY }}
          className="font-cinzel text-[12px] font-semibold uppercase tracking-[0.32em] text-lantern-rose"
        >
          Save the Date
        </motion.span>

        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.06 }}
          className="mt-2 font-display text-[1.85rem] font-light leading-[1.1] tracking-[-0.02em] text-lantern sm:mt-4 sm:text-4xl lg:text-5xl"
        >
          A short film for our forever
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: LUXURY, delay: 0.1 }}
          className="mt-1.5 max-w-xl font-serif text-base italic text-cream/92 sm:mt-3 sm:text-lg"
        >
          Press play and step into the beginning of our happily ever after.
        </motion.p>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: LUXURY, delay: 0.12 }}
        className="relative z-10 mx-auto mt-3 flex w-full items-start justify-center px-3 pb-6 sm:mt-6 sm:min-h-0 sm:flex-1 sm:items-center sm:px-6 sm:pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-10"
      >
        {/* 16:9 stage + object-contain so the full frame fits without cropping. */}
        <div
          ref={stageRef}
          className="relative aspect-video w-full max-h-full overflow-hidden rounded-lg bg-night shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)]"
          onMouseMove={() => {
            if (isMobile) return;
            revealControls();
          }}
          onPointerDown={(event) => {
            // Mobile: any tap on the stage brings the seek line back.
            if (!isMobile) return;
            if (event.pointerType === "mouse") return;
            revealControls();
          }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 z-0 h-full w-full object-contain object-center"
            src={videoSrc}
            poster={SAVE_THE_DATE_VIDEO.posterSrc}
            playsInline
            preload="metadata"
            controls={false}
            width={videoWidth}
            height={videoHeight}
            onLoadedMetadata={syncDuration}
            onDurationChange={syncDuration}
            onTimeUpdate={() => {
              if (draggingRef.current) return;
              const video = videoRef.current;
              if (!video) return;
              setCurrentTime(video.currentTime);
            }}
            onEnded={handleVideoEnded}
            onPause={handleVideoPause}
            onPlay={handleVideoPlay}
          >
            <track kind="captions" />
          </video>

          {showPoster && !playing ? (
            <Image
              src={`${SAVE_THE_DATE_VIDEO.posterSrc}?v=7`}
              alt="Save the date film thumbnail"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-contain object-center"
              priority
              unoptimized
            />
          ) : null}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-night/55 via-transparent to-night/15"
          />

          {/* Leave the bottom chrome free so fullscreen / seek stay clickable */}
          <button
            type="button"
            onClick={() => {
              // First tap on mobile while hidden only reveals the timeline.
              if (isMobile && playing && !controlsVisibleRef.current) {
                revealControls();
                return;
              }
              revealControls();
              void togglePlayback();
            }}
            aria-label={
              playing ? "Pause save the date video" : "Play save the date video"
            }
            className="absolute inset-x-0 top-0 bottom-16 z-10 flex items-center justify-center"
          >
            {!playing && (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-lantern/60 bg-night/70 text-lantern shadow-[0_0_40px_rgba(244,196,68,0.35)] backdrop-blur-md sm:h-20 sm:w-20">
                <Play className="h-7 w-7 translate-x-0.5 fill-current" />
              </span>
            )}
          </button>

          {/* Always visible — not tied to the auto-hiding seek line */}
          <button
            type="button"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void toggleFullscreen();
            }}
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="absolute bottom-3 right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-cream shadow-[0_6px_18px_-8px_rgba(0,0,0,0.7)] backdrop-blur-sm transition hover:bg-black/60 sm:bottom-4 sm:right-4 sm:h-11 sm:w-11"
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          {/* Simple seek line — auto-hides after 3s; mouse move / tap brings it back */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-30 pl-4 pr-14 pb-3 pt-4 transition-opacity duration-300 sm:pl-5 sm:pr-16 sm:pb-3.5",
              controlsVisible
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            )}
            onPointerDown={(event) => {
              event.stopPropagation();
              revealControls();
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-1.5 flex items-center justify-between font-sans text-[10px] tabular-nums tracking-wide text-cream/75 sm:text-[11px]">
              <span>{formatTime(displayTime)}</span>
              <span className="mr-1">{formatTime(duration)}</span>
            </div>

            <div
              ref={scrubberRef}
              role="slider"
              tabIndex={0}
              aria-label="Film timeline"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration || 0)}
              aria-valuenow={Math.round(displayTime)}
              aria-valuetext={`${formatTime(displayTime)} of ${formatTime(duration)}`}
              className="group relative flex h-5 cursor-pointer touch-none items-center"
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture?.(event.pointerId);
                beginScrub(event.clientX);
              }}
              onKeyDown={(event) => {
                const video = videoRef.current;
                if (!video || !duration) return;
                const step = event.shiftKey ? 5 : 2;
                if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                  event.preventDefault();
                  seekToRatio(Math.min(1, (video.currentTime + step) / duration));
                } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                  event.preventDefault();
                  seekToRatio(Math.max(0, (video.currentTime - step) / duration));
                } else if (event.key === "Home") {
                  event.preventDefault();
                  seekToRatio(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  seekToRatio(1);
                }
              }}
            >
              <div className="relative h-px w-full bg-white/25">
                <div
                  className="absolute inset-y-0 left-0 bg-white/85"
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.35)] transition-transform",
                  dragging ? "scale-125" : "group-hover:scale-110",
                )}
                style={{ left: `calc(${progressRatio * 100}% - 0.3rem)` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
