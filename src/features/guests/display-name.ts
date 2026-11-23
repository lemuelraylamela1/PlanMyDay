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

/**
 * Principal sponsors (Ninong & Ninang) are stored as ONE guest so the couple
 * shares one invitation link / QR:
 *   title + firstName + lastName = Ninong
 *   plusOneName (with title)     = Ninang, plusOneAllowed = true
 *   relationship                 = PRINCIPAL_SPONSOR
 */
export const PRINCIPAL_SPONSOR = "Principal Sponsor";

/**
 * Stored as the plus-one when the Ninang's name is left blank, so the pair still
 * counts as a party of 2 (seating, check-in) and the RSVP skips the plus-one prompt.
 */
export const SPONSOR_PARTNER_PLACEHOLDER = "Ninang";

export function isPrincipalSponsor(guest: { relationship?: string | null }) {
  return guest.relationship?.trim().toLowerCase() === PRINCIPAL_SPONSOR.toLowerCase();
}

type GuestNameParts = {
  title?: string | null;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  relationship?: string | null;
  plusOneName?: string | null;
};

/**
 * "Mr. Juan Dela Cruz" + "Mrs. Maria Dela Cruz" → "Mr. Juan & Mrs. Maria Dela Cruz".
 * Different surnames keep both full names: "Mr. Juan Cruz & Mrs. Ana Reyes".
 */
export function composeSponsorPairName(ninong: string, ninang: string) {
  const a = ninong.trim().replace(/\s+/g, " ");
  const b = ninang.trim().replace(/\s+/g, " ");
  if (!a) return b;
  if (!b) return a;
  const aWords = a.split(" ");
  const bWords = b.split(" ");
  // Longest shared surname suffix (handles "Dela Cruz", "De los Santos").
  let shared = 0;
  while (
    shared < aWords.length - 1 &&
    shared < bWords.length - 1 &&
    (aWords[aWords.length - 1 - shared] ?? "").toLowerCase() ===
      (bWords[bWords.length - 1 - shared] ?? "").toLowerCase()
  ) {
    shared += 1;
  }
  if (shared === 0) return `${a} & ${b}`;
  const surname = aWords.slice(aWords.length - shared).join(" ");
  return `${aWords.slice(0, aWords.length - shared).join(" ")} & ${bWords
    .slice(0, bWords.length - shared)
    .join(" ")} ${surname}`;
}

/** Splits a stored "Mrs. Maria Dela Cruz" into its title and the rest. */
export function splitTitledName(value: string | null | undefined): {
  title: GuestTitleOption | "";
  name: string;
} {
  const text = value?.trim() ?? "";
  for (const option of GUEST_TITLE_OPTIONS) {
    if (text.toLowerCase().startsWith(`${option.toLowerCase()} `)) {
      return { title: option, name: text.slice(option.length).trim() };
    }
  }
  return { title: "", name: text };
}

/**
 * Builds the formal display name used in RSVP greetings, e.g. "Mr. John Doe".
 * Title is optional; preferred name overrides first+last when present.
 * Principal sponsors render as the pair, e.g. "Mr. Juan & Mrs. Maria Dela Cruz".
 */
export function formatGuestDisplayName(guest: GuestNameParts): string {
  const preferred = guest.preferredName?.trim();
  const title = guest.title?.trim();
  if (isPrincipalSponsor(guest)) {
    if (preferred) return preferred;
    const ninong = [title, guest.firstName?.trim(), guest.lastName?.trim()].filter(Boolean).join(" ");
    const ninang = guest.plusOneName?.trim() === SPONSOR_PARTNER_PLACEHOLDER ? "" : guest.plusOneName ?? "";
    return composeSponsorPairName(ninong, ninang) || "Principal sponsors";
  }
  const base = preferred || `${guest.firstName} ${guest.lastName}`.trim();
  return title ? `${title} ${base}` : base;
}
