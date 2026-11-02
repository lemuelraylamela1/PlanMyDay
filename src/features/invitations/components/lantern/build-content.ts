import { weddingDefaults, type WeddingDefaults } from "./config/wedding-defaults";
import type { InvitationWedding } from "./types";

/**
 * Builds a merged wedding config object based on weddingDefaults,
 * overlaying live data from InvitationWedding + guestName.
 */
export function buildContent(
  wedding: InvitationWedding | null | undefined,
  guestName: string | null | undefined
): WeddingDefaults {
  if (!wedding) return weddingDefaults;

  const d = weddingDefaults;

  // Parse couple names from the coupleNames string (e.g. "Lemuel & Grazielle")
  // or fall back to partner1/partner2 names.
  const partner1 = wedding.partner1Name ?? d.couple.groom.first;
  const partner2 = wedding.partner2Name ?? d.couple.bride.first;

  const dateLong = wedding.dateLabel ?? d.event.dateLong;
  const isoDate = wedding.countdownTargetIso ?? d.event.isoDate;
  const venueName = wedding.venueName ?? d.event.venue.name;
  const venueAddress = wedding.venueAddress ?? d.event.venue.address;
  const dressCodeGuests = wedding.dressCode ?? d.event.dressCode.guests;

  // Parse ceremony/reception time labels (e.g. "3:00 PM" or "3:00 PM · Philippine Time")
  const parsedCeremonyTime = wedding.ceremonyTimeLabel
    ? parseTimeLabel(wedding.ceremonyTimeLabel)
    : { time: d.event.ceremony.time, tz: d.event.ceremony.timezoneNote };
  const parsedReceptionTime = wedding.receptionTimeLabel
    ? parseTimeLabel(wedding.receptionTimeLabel)
    : { time: d.event.reception.time, tz: d.event.reception.timezoneNote };

  // Build greeting with guest name
  const greeting = guestName
    ? `Dear ${guestName}`
    : d.invitation.greetingDefault.replace("{{guestName}}", "Guest");

  return {
    ...d,
    couple: {
      ...d.couple,
      groom: { first: partner1, full: wedding.partner1Name ?? d.couple.groom.full },
      bride: { first: partner2, full: wedding.partner2Name ?? d.couple.bride.full },
    },
    event: {
      ...d.event,
      isoDate: isoDate as string,
      dateLong,
      dateShort: dateLong,
      ceremony: {
        ...d.event.ceremony,
        venue: venueName,
        time: parsedCeremonyTime.time,
        timezoneNote: parsedCeremonyTime.tz,
      },
      reception: {
        ...d.event.reception,
        venue: venueName,
        time: parsedReceptionTime.time,
        timezoneNote: parsedReceptionTime.tz,
      },
      venue: {
        ...d.event.venue,
        name: venueName,
        address: venueAddress,
        city: extractCity(venueAddress) ?? d.event.venue.city,
        mapsQuery: venueName,
      },
      dressCode: {
        ...d.event.dressCode,
        guests: dressCodeGuests,
      },
    },
    invitation: {
      ...d.invitation,
      greetingDefault: greeting,
    },
    story: wedding.story
      ? {
          ...d.story,
          intro: wedding.story,
        }
      : d.story,
  } as unknown as WeddingDefaults;
}

function parseTimeLabel(label: string): { time: string; tz: string } {
  const parts = label.split("·").map((s) => s.trim());
  return {
    time: parts[0] ?? label,
    tz: parts[1] ?? "Local Time",
  };
}

function extractCity(address: string | null): string | null {
  if (!address) return null;
  // Try to extract city from "Venue Name, City, Country" pattern
  const parts = address.split(",").map((s) => s.trim());
  return parts.length >= 2 ? (parts[1] ?? null) : null;
}
