"use client";

import { Car, Hotel } from "lucide-react";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";
import { LuxuryCard } from "../ui/luxury-card";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

export function Travel() {
  const wedding = useLanternContent();

  return (
    <section
      id="travel"
      className="relative overflow-hidden lantern-section"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <MagicDust count={14} intensity="soft" className="opacity-40" />
      <SceneAtmosphere tone="warm" className="opacity-50" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={wedding.travel.eyebrow}
          title={wedding.travel.title}
          intro={wedding.travel.intro}
          theme="light"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wedding.travel.hotels.map((hotel, i) => (
            <Reveal key={i} index={i} variant="cinematic-card">
              <LuxuryCard className="storybook-panel h-full" variant="light">
                <span className="flex h-12 w-12 items-center justify-center rounded-full text-lantern-rose" style={{ background: "rgba(232,130,154,0.1)", border: "1px solid rgba(232,130,154,0.3)" }}>
                  <Hotel className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{hotel.name}</h3>
                <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-lantern-rose/70">{hotel.distance}</p>
                <p className="mt-3 font-serif text-[1.05rem] leading-[1.85] text-ink/80">{hotel.description}</p>
                <p className="mt-3 font-sans text-sm font-semibold text-lantern" style={{ color: "#b8860b" }}>{hotel.priceNote}</p>
                {hotel.url && (
                  <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-sans text-xs text-lantern-rose underline underline-offset-2">
                    Visit website →
                  </a>
                )}
              </LuxuryCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <LuxuryCard variant="light" className="storybook-panel">
            <div className="flex items-start gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lantern-rose" style={{ background: "rgba(232,130,154,0.1)", border: "1px solid rgba(232,130,154,0.3)" }}>
                <Car className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">Getting There</h3>
                <p className="mt-1 font-serif text-[1.05rem] leading-[1.85] text-ink/80">{wedding.travel.transportation}</p>
              </div>
            </div>
          </LuxuryCard>
        </Reveal>
      </div>
    </section>
  );
}
