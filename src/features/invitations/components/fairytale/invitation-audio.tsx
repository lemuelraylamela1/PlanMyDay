"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";

interface InvitationAudioApi {
  /** Call from a user gesture (envelope click) so later play() is allowed. */
  unlock: () => Promise<void>;
  /** Soft magical bed while the scroll opens and dissolves. */
  startTransition: () => Promise<void>;
  /** Crossfade to the Tangled theme once the website is revealed. */
  start: () => Promise<void>;
  duck: () => void;
  unduck: () => void;
  playing: boolean;
}

const InvitationAudioContext = React.createContext<InvitationAudioApi | null>(null);

export function useInvitationAudio() {
  return React.useContext(InvitationAudioContext);
}

export function InvitationAudioProvider({ children }: { children: React.ReactNode }) {
  const transitionRef = React.useRef<HTMLAudioElement>(null);
  const ambientRef = React.useRef<HTMLAudioElement>(null);
  const unlocked = React.useRef(false);
  const wantedOn = React.useRef(false);
  const ducked = React.useRef(false);
  const phase = React.useRef<"idle" | "transition" | "ambient">("idle");
  const [playing, setPlaying] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const transitionTrack = fairytaleMedia.transitionMusic;
  const ambientTrack = fairytaleMedia.ambientMusic;

  const activeEl = React.useCallback(() => {
    if (phase.current === "transition") return transitionRef.current;
    if (phase.current === "ambient") return ambientRef.current;
    return null;
  }, []);

  const syncPlayback = React.useCallback(async () => {
    const transition = transitionRef.current;
    const ambient = ambientRef.current;
    if (!transition || !ambient) return;

    const shouldPlay = wantedOn.current && !ducked.current;
    if (!shouldPlay) {
      transition.pause();
      ambient.pause();
      setPlaying(false);
      return;
    }

    try {
      if (phase.current === "transition") {
        ambient.pause();
        await transition.play();
        setPlaying(true);
      } else if (phase.current === "ambient") {
        transition.pause();
        await ambient.play();
        setPlaying(true);
      }
    } catch {
      setPlaying(false);
    }
  }, []);

  const unlock = React.useCallback(async () => {
    if (unlocked.current) return;
    const els = [transitionRef.current, ambientRef.current].filter(Boolean) as HTMLAudioElement[];
    for (const audio of els) {
      const previousVolume = audio.volume;
      audio.volume = 0;
      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Retry later from startTransition / start.
      } finally {
        audio.volume = previousVolume || 0.55;
      }
    }
    unlocked.current = true;
  }, []);

  const fadeVolume = React.useCallback((audio: HTMLAudioElement, to: number, ms: number) => {
    const from = audio.volume;
    const steps = Math.max(1, Math.round(ms / 40));
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      audio.volume = from + (to - from) * (step / steps);
      if (step >= steps) {
        window.clearInterval(id);
        audio.volume = to;
        if (to === 0) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    }, 40);
  }, []);

  const startTransition = React.useCallback(async () => {
    const audio = transitionRef.current;
    if (!audio || phase.current === "transition") return;
    phase.current = "transition";
    audio.volume = 0.45;
    // Skip the intro; the magical bed begins at 0:06 (and on every loop).
    audio.currentTime = 6;
    wantedOn.current = true;
    setStarted(true);
    await syncPlayback();
  }, [syncPlayback]);

  React.useEffect(() => {
    const audio = transitionRef.current;
    if (!audio) return;
    const restartFromCue = () => {
      if (phase.current !== "transition" || !wantedOn.current || ducked.current) return;
      audio.currentTime = 6;
      void audio.play();
    };
    audio.addEventListener("ended", restartFromCue);
    return () => audio.removeEventListener("ended", restartFromCue);
  }, []);

  const start = React.useCallback(async () => {
    const ambient = ambientRef.current;
    const transition = transitionRef.current;
    if (!ambient) return;
    if (phase.current === "ambient" && wantedOn.current) {
      await syncPlayback();
      return;
    }

    if (transition && phase.current === "transition" && !transition.paused) {
      fadeVolume(transition, 0, 900);
    }

    phase.current = "ambient";
    ambient.volume = 0;
    ambient.currentTime = 0;
    wantedOn.current = true;
    setStarted(true);
    try {
      await ambient.play();
      setPlaying(true);
      fadeVolume(ambient, 0.55, 1100);
    } catch {
      setPlaying(false);
    }
  }, [fadeVolume, syncPlayback]);

  const duck = React.useCallback(() => {
    ducked.current = true;
    void syncPlayback();
  }, [syncPlayback]);

  const unduck = React.useCallback(() => {
    ducked.current = false;
    void syncPlayback();
  }, [syncPlayback]);

  const toggle = React.useCallback(() => {
    wantedOn.current = !wantedOn.current;
    setStarted(true);
    if (phase.current === "idle") phase.current = "ambient";
    void syncPlayback();
  }, [syncPlayback]);

  const api = React.useMemo(
    () => ({ unlock, startTransition, start, duck, unduck, playing }),
    [unlock, startTransition, start, duck, unduck, playing],
  );

  // Keep React state in sync if the active element ends unexpectedly.
  React.useEffect(() => {
    const onPause = () => {
      const el = activeEl();
      if (el && el.paused && wantedOn.current && !ducked.current) setPlaying(false);
    };
    const onPlay = () => setPlaying(true);
    const els = [transitionRef.current, ambientRef.current];
    els.forEach((el) => {
      el?.addEventListener("pause", onPause);
      el?.addEventListener("play", onPlay);
    });
    return () => {
      els.forEach((el) => {
        el?.removeEventListener("pause", onPause);
        el?.removeEventListener("play", onPlay);
      });
    };
  }, [activeEl]);

  return (
    <InvitationAudioContext.Provider value={api}>
      <audio
        ref={transitionRef}
        src={transitionTrack.src}
        preload="auto"
        playsInline
        aria-hidden
      />
      <audio ref={ambientRef} src={ambientTrack.src} preload="auto" loop playsInline aria-hidden />
      {children}
      {started && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Mute music" : "Play music"}
          aria-pressed={playing}
          className={cn(
            "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 mix-blend-difference focus-visible:outline-none",
          )}
        >
          <span className="flex items-center gap-2 border border-white px-3 py-2 text-white transition-opacity hover:opacity-80">
            <MusicGlyph playing={playing} />
            <span className={cn(smallCaps, "text-[8px] tracking-[0.18em] text-white")}>
              {playing ? "Sound on" : "Sound off"}
            </span>
          </span>
        </button>
      )}
    </InvitationAudioContext.Provider>
  );
}

function MusicGlyph({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="relative flex h-3.5 w-3.5 items-end justify-between gap-[2px]">
      {[0.45, 0.85, 0.6, 1].map((height, index) => (
        <span
          key={index}
          className="block w-[2px] rounded-full bg-current"
          style={{
            height: `${height * 100}%`,
            opacity: playing ? 1 : 0.35,
            transform: playing ? undefined : "scaleY(0.35)",
            transformOrigin: "bottom",
          }}
        />
      ))}
    </span>
  );
}
