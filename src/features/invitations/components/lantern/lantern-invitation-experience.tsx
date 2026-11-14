"use client";

import * as React from "react";
import { LanternContentProvider } from "./content-context";
import { Experience } from "./experience/experience";
import { Hero } from "./sections/hero";
import { PortraitHero } from "./sections/portrait-hero";
import { Quote } from "./sections/quote";
import { SaveTheDate } from "./sections/save-the-date";
import { OurStory } from "./sections/our-story";
import { EventDetails } from "./sections/event-details";
import { Attire } from "./sections/attire";
import { MonetaryGifts } from "./sections/monetary-gifts";
import { Gallery } from "./sections/gallery";
import { Countdown } from "./sections/countdown";
import { Faq } from "./sections/faq";
import { FinalInvitation } from "./sections/final-invitation";
import { Rsvp } from "./sections/rsvp";
import { SiteFooter } from "./sections/site-footer";
import { buildContent } from "./build-content";
import type { InvitationGuest, InvitationResponse, InvitationWedding } from "./types";

export interface LanternInvitationExperienceProps {
  token?: string | null;
  guest?: InvitationGuest | null;
  response?: InvitationResponse | null;
  wedding?: InvitationWedding | null;
}

export function LanternInvitationExperience({
  token,
  guest,
  response,
  wedding,
}: LanternInvitationExperienceProps) {
  const content = React.useMemo(
    () => buildContent(wedding ?? null, guest?.name ?? null),
    [wedding, guest]
  );

  // Only a completed RSVP should surface the section without clicking "RSVP Now".
  const hasRsvpReceipt =
    guest?.rsvpStatus != null && guest.rsvpStatus !== "PENDING";

  return (
    <LanternContentProvider value={content}>
      <Experience
        token={token}
        guestName={guest?.name}
        initialRsvpOpen={hasRsvpReceipt}
      >
        <main>
          <Hero />
          <PortraitHero />
          <Quote />
          <SaveTheDate />
          <Gallery />
          <OurStory />
          <EventDetails />
          <Attire />
          <MonetaryGifts />
          <Countdown />
          {/* Travel & Accommodation — hidden for now */}
          <Faq />
          <FinalInvitation />
          <Rsvp
            token={token}
            guest={guest}
            response={response}
            monogram={wedding?.monogram}
          />
        </main>
        <SiteFooter />
      </Experience>
    </LanternContentProvider>
  );
}
