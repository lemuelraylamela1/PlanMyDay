"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { smallCaps } from "@/features/invitations/components/fairytale/ornaments";
import { fairytaleMedia } from "@/features/invitations/components/fairytale/fairytale-media";

interface InvitationAudioApi {
  /** Call from a user gesture (envelope click) so later play() is allowed. */
  unlock: () => Promise<void>;
  /** Begin looping the ambient track (RSVP section in view). */
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
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const unlocked = React.useRef(false);
  const wantedOn = React.useRef(false);
  const ducked = React.useRef(false);
  const [playing, setPlaying] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const track = fairytaleMedia.ambientMusic;

  const syncPlayback = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (wantedOn.current && !ducked.current) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  const unlock = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || unlocked.current) return;
    const previousVolume = audio.volume;
    audio.volume = 0;
    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      unlocked.current = true;
    } catch {
      // Still mark unlocked attempt; start() will retry when RSVP appears.
    } finally {
      audio.volume = previousVolume || 0.55;
    }
  }, []);

  const start = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || wantedOn.current) return;
    audio.volume = 0.55;
    wantedOn.current = true;
    setStarted(true);
    await syncPlayback();
  }, [syncPlayback]);

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
    void syncPlayback();
  }, [syncPlayback]);

  const api = React.useMemo(
    () => ({ unlock, start, duck, unduck, playing }),
    [unlock, start, duck, unduck, playing],
  );

  return (
    <InvitationAudioContext.Provider value={api}>
      <audio ref={audioRef} src={track.src} preload="auto" loop playsInline aria-hidden />
      {children}
      {started && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Mute music" : "Play music"}
          aria-pressed={playing}
          className={cn(
            "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex items-center gap-2 border border-[#DDBF8D]/45 bg-[#1d1820]/78 px-3 py-2 text-[#F3E7D3] shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:border-[#DDBF8D]/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DDBF8D]",
          )}
        >
          <MusicGlyph playing={playing} />
          <span className={cn(smallCaps, "text-[8px] tracking-[0.18em]")}>
            {playing ? "Sound on" : "Sound off"}
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
