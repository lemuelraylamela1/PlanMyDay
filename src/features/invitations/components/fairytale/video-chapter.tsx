"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

import { cn } from "@/lib/utils";
import { useReveal } from "@/features/invitations/components/fairytale/use-reveal";
import { displayFont, smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";
import { useInvitationAudio } from "@/features/invitations/components/fairytale/invitation-audio";
import { pageParchment } from "@/features/invitations/components/fairytale/textures";
import { fairytaleAtmosphere } from "@/features/invitations/components/fairytale/fairytale-tokens";
import { ChapterContinue } from "@/features/invitations/components/fairytale/chapter-continue";

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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: fairytaleAtmosphere.champagneMist }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <motion.p {...reveal(0)} className={cn(smallCaps, "text-[#B76E79]")}>
            Save the date
          </motion.p>
          <motion.h2
            {...reveal(0.12, 28)}
            className={cn(displayFont, "mt-5 text-4xl font-light tracking-[-0.02em] text-[#4a3236] sm:text-5xl")}
          >
            A short film for our forever
          </motion.h2>
        </div>

        <motion.div {...reveal(0.28)} className="relative mt-12 sm:mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-3 border border-[#DDBF8D]/35 sm:-inset-4"
          />
          <div className="relative overflow-hidden bg-[#22243A]">
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
                  className="absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(34,36,58,0.2),rgba(34,36,58,0.58))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFFDF8]"
                  aria-label="Play save the date film"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E8D4A8]/70 bg-[#22243A]/55 text-[#FFFDF8] backdrop-blur-sm sm:h-20 sm:w-20">
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

        <ChapterContinue href="#prenup" className="mx-auto mt-14" revealProps={reveal(0.35, 12)}>
          Continue
        </ChapterContinue>
      </div>
    </section>
  );
}
