import type { Metadata } from "next";

import { db } from "@/lib/db";
import { resolveInvitation, markInvitationOpened } from "@/features/invitations/service";
import { formatGuestDisplayName } from "@/features/guests/display-name";
import { InvitationExperience } from "@/features/invitations/components/fairytale/invitation-experience";
import { InvitationNotFound } from "@/features/invitations/components/fairytale/invitation-not-found";

export const metadata: Metadata = { title: "You're Invited" };

function formatInZone(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions) {
  const zone = timeZone === "GMT" ? "UTC" : timeZone;
  try {
    return new Intl.DateTimeFormat("en-PH", { ...options, timeZone: zone }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-PH", options).format(date);
  }
}

const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await resolveInvitation(token);

  if (!invitation) return <InvitationNotFound />;

  await markInvitationOpened(token);

  const { guest, wedding } = invitation;
  const latestResponse = await db.rsvpResponse.findFirst({
    where: { guestId: guest.id, weddingId: wedding.id },
    orderBy: { submittedAt: "desc" },
  });

  const partnerNames = [wedding.partner1Name, wedding.partner2Name].filter(
    (name): name is string => Boolean(name?.trim()),
  );
  const coupleNames = partnerNames.join(" & ") || wedding.title;
  const initials = (partnerNames.length > 0 ? partnerNames : [wedding.title])
    .map((name) => name.trim().charAt(0).toUpperCase())
    .filter(Boolean);

  return (
    <InvitationExperience
      token={token}
      guest={{
        name: formatGuestDisplayName(guest),
        plusOneAllowed: guest.plusOneAllowed,
        rsvpStatus: guest.rsvpStatus,
      }}
      response={
        latestResponse
          ? {
              attending: latestResponse.attending,
              partySize: latestResponse.partySize,
              mealPreference: latestResponse.mealPreference,
              dietaryRestrictions: latestResponse.dietaryRestrictions,
              plusOneName: latestResponse.plusOneName,
              message: latestResponse.message,
            }
          : null
      }
      wedding={{
        coupleNames,
        partner1Name: wedding.partner1Name,
        partner2Name: wedding.partner2Name,
        monogram: initials.join(" & "),
        dateLabel: wedding.date
          ? formatInZone(wedding.date, "UTC", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null,
        countdownTargetIso: (wedding.ceremonyTime ?? wedding.date)?.toISOString() ?? null,
        ceremonyTimeLabel: wedding.ceremonyTime
          ? formatInZone(wedding.ceremonyTime, wedding.timezone, timeOptions)
          : null,
        receptionTimeLabel: wedding.receptionTime
          ? formatInZone(wedding.receptionTime, wedding.timezone, timeOptions)
          : null,
        venueName: wedding.venueName,
        venueAddress: wedding.venueAddress,
        story: wedding.settings?.story?.trim() || null,
      }}
    />
  );
}
