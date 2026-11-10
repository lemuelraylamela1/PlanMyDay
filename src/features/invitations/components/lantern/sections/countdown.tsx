"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "../ui/section-heading";
import { FloatingLanterns } from "../effects/floating-lanterns";
import Galaxy from "../effects/Galaxy";
import { MagicDust } from "../effects/magic-dust";
import { LanternReflection } from "../effects/lantern-reflection";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";
import {
  useLanternPerf,
  useMainEffectsActive,
} from "../performance/lantern-perf-provider";
import { useNearViewport } from "../hooks/use-near-viewport";

/** Bright stars on the lantern night palette — soft violet + lantern gold. */
const GALAXY_STAR_COLORS = ["#f3eeff", "#c4b5fd", "#ffdf70", "#f4c444"];

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(target: number): TimeLeft | null {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const wedding = useLanternContent();
  const { profile, reduceMotion, quality, compact } = useLanternPerf();
  const effectsActive = useMainEffectsActive();
  const sectionRef = React.useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef, { enabled: effectsActive });
  const target = React.useMemo(
    () => new Date(wedding.event.isoDate).getTime(),
    [wedding.event.isoDate]
  );
  const [time, setTime]     = React.useState<TimeLeft | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const showGalaxy = effectsActive && near;

  const galaxyDensity = quality === "high" ? 1.35 : quality === "balanced" ? 1 : 0.7;
  const galaxyLayers = quality === "high" ? 6 : quality === "balanced" ? 4 : 3;

  React.useEffect(() => {
    const initial = window.setTimeout(() => {
      setMounted(true);
      setTime(getTimeLeft(target));
    }, 0);
    const id = window.setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(id);
    };
  }, [target]);

  const units = time
    ? [
        { label: "Days",    value: time.days    },
        { label: "Hours",   value: time.hours   },
        { label: "Minutes", value: time.minutes },
        { label: "Seconds", value: time.seconds },
      ]
    : [];

  return (
    <section
      ref={sectionRef}
      id="countdown"
      className="relative overflow-hidden lantern-section"
      style={{ background: "linear-gradient(180deg, #0d0720 0%, #1e0f3a 60%, #2d1b5e 100%)" }}
    >
      {/* Opaque violet starfield — transparent WebGL was compositing as a washed blank sky. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      >
        {showGalaxy ? (
          <Galaxy
            starColors={GALAXY_STAR_COLORS}
            density={compact ? galaxyDensity * 1.15 : galaxyDensity}
            layers={galaxyLayers}
            glowIntensity={compact ? 0.7 : 0.55}
            flareIntensity={0.85}
            starSize={compact ? 1.35 : 1.15}
            twinkleIntensity={0.45}
            starSpeed={0.35}
            speed={0.9}
            rotationSpeed={0.05}
            mouseRepulsion
            mouseInteraction={!reduceMotion && !compact}
            clickWarp={!reduceMotion && !compact}
            intro={!reduceMotion}
            disableAnimation={reduceMotion}
            transparent={false}
            backgroundColor="#0d0720"
            opacity={1}
            dpr={profile.maxDpr}
          />
        ) : null}
        {/* Soft violet depth so the field still reads as the lantern night gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(30,15,58,0.35) 55%, rgba(45,27,94,0.55) 100%)",
          }}
        />
      </div>

      <MagicDust count={10} intensity="soft" className="z-[2] opacity-35 max-sm:opacity-25" />
      <SceneAtmosphere tone="night" className="z-[2] opacity-40" />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
        <div className="lantern-glow absolute left-1/2 top-1/2 h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 opacity-35" />
        <div className="aurora-glow absolute left-1/2 top-1/3 h-[40vh] w-[80vw] -translate-x-1/2 opacity-35" />
      </div>

      <FloatingLanterns count={8} intensity="festival" className="z-[3] opacity-80 max-sm:opacity-60" />
      <LanternReflection className="z-[3] opacity-50" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.countdown.eyebrow}
          title={wedding.countdown.title}
          theme="dark"
        />

        <div className="mt-14">
          {mounted && !time ? (
            <p className="text-center font-display text-3xl text-lantern">
              {wedding.countdown.finishedMessage}
            </p>
          ) : (
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {units.map((u) => (
                <div
                  key={u.label}
                  className="dark-glass relative flex flex-col items-center rounded-2xl px-3 py-6"
                  style={{ boxShadow: "0 0 30px rgba(244,196,68,0.12)" }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl"
                    style={{
                      background: "linear-gradient(180deg, rgba(244,196,68,0.08) 0%, transparent 100%)",
                    }}
                  />
                  <div className="relative h-16 w-full overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={u.value}
                        initial={{ y: "60%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "-60%", opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 flex items-center justify-center font-cinzel text-5xl font-bold tabular-nums text-lantern sm:text-6xl"
                        style={{ textShadow: "0 0 20px rgba(244,196,68,0.5)" }}
                      >
                        {String(u.value).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="mt-2 font-sans text-[11px] uppercase tracking-[0.35em] text-lantern-rose/80">
                    {u.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 text-center font-serif text-lg italic text-lantern-soft">
          {wedding.event.dateLong.toLowerCase().startsWith(wedding.event.dayOfWeek.toLowerCase())
            ? wedding.event.dateLong
            : `${wedding.event.dayOfWeek}, ${wedding.event.dateLong}`}
        </p>
      </div>
    </section>
  );
}
