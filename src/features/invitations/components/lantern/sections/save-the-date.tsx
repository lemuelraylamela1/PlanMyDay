"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";

import { SAVE_THE_DATE_VIDEO } from "../media";
import { MagicDust } from "../effects/magic-dust";

const LUXURY = [0.16, 1, 0.3, 1] as const;

/**
 * Save-the-date film after the quote — exact viewport height, full-bleed 2K 16:9.
 */
export function SaveTheDate() {
  const reduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!inView && !video.paused) {
      video.pause();
      setPlaying(false);
    }
  }, [inView]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        video.muted = false;
        await video.play();
        setPlaying(true);
      } catch {
        video.muted = true;
        await video.play();
        setPlaying(true);
      }
    } else {
      video.pause();
      setPlaying(false);
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
        className="relative z-10 mx-auto mt-4 min-h-0 w-full flex-1 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:mt-6 sm:px-6 lg:px-10"
      >
        <div className="relative h-full w-full overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-contain object-center"
            src={SAVE_THE_DATE_VIDEO.src}
            playsInline
            preload="metadata"
            controls={false}
            width={SAVE_THE_DATE_VIDEO.width}
            height={SAVE_THE_DATE_VIDEO.height}
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
          >
            <track kind="captions" />
          </video>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/40 via-transparent to-night/15"
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
        </div>
      </motion.div>
    </section>
  );
}
