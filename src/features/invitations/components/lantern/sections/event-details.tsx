"use client";

import * as React from "react";
import { Clock, Heart, MapPin, PartyPopper, Shirt } from "lucide-react";
import { SectionHeading } from "../ui/section-heading";
import { Reveal } from "../ui/reveal";
import { LuxuryCard } from "../ui/luxury-card";
import { GoldButton } from "../ui/gold-button";
import { MagicDust } from "../effects/magic-dust";
import { SceneAtmosphere } from "../effects/scene-atmosphere";
import { useLanternContent } from "../content-context";

export function EventDetails() {
  const wedding = useLanternContent();
  const { ceremony, reception, venue, dressCode } = wedding.event;

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery)}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(venue.mapsQuery)}&output=embed`;

  return (
    <section
      id="details"
      className="relative overflow-hidden lantern-section"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <MagicDust count={16} intensity="soft" className="opacity-35" />
      <SceneAtmosphere tone="lantern-rose" className="opacity-50" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The Celebration"
          title="Event Details"
          intro="We can't wait to celebrate with you. Here is everything you need to know about our special day."
          theme="light"
        />

        <div className="mt-10 grid gap-5 sm:mt-16 sm:gap-6 md:grid-cols-2">
          <Reveal index={0} variant="cinematic-card">
            <LuxuryCard className="storybook-panel h-full" variant="light">
              <DetailIcon icon={<Heart className="h-5 w-5" />} />
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{ceremony.label}</h3>
              <p className="mt-1 font-serif italic text-lantern-rose/80">{ceremony.detail}</p>
              <DetailRow icon={<Clock className="h-4 w-4" />} text={`${ceremony.time} · ${ceremony.timezoneNote}`} />
              <DetailRow icon={<MapPin className="h-4 w-4" />} text={`${ceremony.venue}, ${venue.city}`} />
            </LuxuryCard>
          </Reveal>

          <Reveal index={1} variant="cinematic-card">
            <LuxuryCard className="storybook-panel h-full" variant="light">
              <DetailIcon icon={<PartyPopper className="h-5 w-5" />} />
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{reception.label}</h3>
              <p className="mt-1 font-serif italic text-lantern-rose/80">{reception.detail}</p>
              <DetailRow icon={<Clock className="h-4 w-4" />} text={`${reception.time} · ${reception.timezoneNote}`} />
              <DetailRow icon={<MapPin className="h-4 w-4" />} text={`${reception.venue}, ${venue.city}`} />
            </LuxuryCard>
          </Reveal>

          <Reveal index={2} variant="cinematic-card">
            <LuxuryCard className="storybook-panel h-full" variant="light">
              <DetailIcon icon={<Shirt className="h-5 w-5" />} />
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{dressCode.title}</h3>
              <p className="mt-3 font-serif text-[1.05rem] leading-[1.85] text-ink/85">
                <span className="font-semibold text-ink">Guests:</span>{" "}
                {dressCode.guests}
              </p>
              <p className="mt-2 font-serif text-[1.05rem] leading-[1.85] text-ink/85">
                <span className="font-semibold text-ink">Ninongs &amp; Ninangs:</span>{" "}
                {dressCode.principalSponsors}
              </p>
              <div className="mt-5 flex items-center gap-2">
                {["#fdf6ec","#f5c0cf","#e8829a","#c0607a"].map((c) => (
                  <span
                    key={c}
                    className="h-8 w-8 rounded-full shadow-sm"
                    style={{ background: c, border: "1px solid rgba(232,130,154,0.3)" }}
                  />
                ))}
              </div>
              <p className="mt-3 font-serif text-sm italic text-ink/55">{dressCode.note}</p>
            </LuxuryCard>
          </Reveal>

          <Reveal index={3} variant="cinematic-card">
            <LuxuryCard className="storybook-panel flex h-full flex-col" variant="light">
              <DetailIcon icon={<MapPin className="h-5 w-5" />} />
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{venue.name}</h3>
              <p className="mt-1 font-serif italic text-lantern-rose/80">{venue.address}</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-lantern-rose/15">
                <iframe
                  title={`Map to ${venue.name}`}
                  src={mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-44 w-full sm:h-48"
                />
              </div>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full sm:inline-block sm:w-auto"
              >
                <GoldButton variant="outline-rose" size="sm" className="w-full sm:w-auto">
                  Get Directions
                </GoldButton>
              </a>
            </LuxuryCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DetailIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span
      className="flex h-12 w-12 items-center justify-center rounded-full text-lantern-rose"
      style={{
        background: "rgba(232,130,154,0.1)",
        border: "1px solid rgba(232,130,154,0.3)",
      }}
    >
      {icon}
    </span>
  );
}

function DetailRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 text-ink/80">
      <span className="text-lantern-rose/70">{icon}</span>
      <span className="font-sans text-sm leading-relaxed tracking-wide">{text}</span>
    </div>
  );
}
