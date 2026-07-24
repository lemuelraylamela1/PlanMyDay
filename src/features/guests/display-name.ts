/** Common honorifics shown in guest forms and RSVP greetings. */
export const GUEST_TITLE_OPTIONS = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Miss",
  "Dr.",
  "Atty.",
  "Engr.",
] as const;

export type GuestTitleOption = (typeof GUEST_TITLE_OPTIONS)[number];

type GuestNameParts = {
  title?: string | null;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
};

/**
 * Builds the formal display name used in RSVP greetings, e.g. "Mr. John Doe".
 * Title is optional; preferred name overrides first+last when present.
 */
export function formatGuestDisplayName(guest: GuestNameParts): string {
  const base = guest.preferredName?.trim() || `${guest.firstName} ${guest.lastName}`.trim();
  const title = guest.title?.trim();
  return title ? `${title} ${base}` : base;
}
