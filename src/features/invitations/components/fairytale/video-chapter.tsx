"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

import { cn } from "@/lib/utils";
import { fairytaleEase, useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";
import { useInvitationAudio } from "@/features/invitations/components/fairytale/invitation-audio";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";

export function VideoChapter() {
  const ref = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const reveal = useReveal();
  const audio = useInvitationAudio();
  const inView = useInView(ref, { amount: 0.45 });
  const [playing, setPlaying] = React.useState(false);
  const film = fairytaleMedia.saveTheDate;

  const markPlaying = React.useCallback(
    (next: boolean) => {
      setPlaying(next);
      if (next) audio?.duck();
      else audio?.unduck();
    },
    [audio],
  );

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!inView) {
      video.pause();
      markPlaying(false);
    }
  }, [inView, markPlaying]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        video.muted = false;
        await video.play();
        markPlaying(true);
      } catch {
        video.muted = true;
        await video.play();
        markPlaying(true);
      }
    } else {
      video.pause();
      markPlaying(false);
    }
  }

  return (
    <section
      id="film"
      ref={ref}
      className="relative overflow-hidden px-5 py-24 sm:px-10 sm:py-32"
      style={{ backgroundImage: pageParchment }}
    >
      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#B76E79]")}>
            Save the date
          </motion.p>
          <motion.h2
            {...reveal(0.12, 28)}
            className={cn(displayFont, "mt-5 text-4xl font-light text-[#4a3236] sm:text-5xl")}
          >
            A short film for our forever
          </motion.h2>
        </div>

        <motion.div {...reveal(0.28)} className="relative mt-12 sm:mt-16">
          <div className="relative overflow-hidden bg-[#1c1619] shadow-[0_28px_60px_-28px_rgba(74,50,54,0.55)]">
            <div className="relative aspect-[16/10] w-full sm:aspect-video">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={film.src}
                playsInline
                preload="metadata"
                controls={playing}
                onPlay={() => markPlaying(true)}
                onPause={() => markPlaying(false)}
                onEnded={() => markPlaying(false)}
                aria-label={film.title}
              />

              {!playing && (
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(18,14,17,0.18),rgba(18,14,17,0.55))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]"
                  aria-label="Play save the date film"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#DDBF8D]/70 bg-[#1c1619]/55 text-[#FFFDF8] backdrop-blur-sm sm:h-20 sm:w-20">
                    <span
                      aria-hidden
                      className="ml-1 block h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-[#FFFDF8] sm:border-y-[12px] sm:border-l-[20px]"
                    />
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.a
          {...reveal(0.35, 12)}
          href="#prenup"
          className={cn(
            smallCaps,
            "mx-auto mt-14 flex w-fit flex-col items-center gap-3 text-[#9b7b62] transition-colors hover:text-[#B76E79] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
          )}
        >
          Continue
          <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-[#DDBF8D]/40">
            <motion.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-[#B76E79]"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: fairytaleEase }}
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
