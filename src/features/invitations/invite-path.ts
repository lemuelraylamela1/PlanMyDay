/** Public invite path brand: Lemuel & Grazielle wedding. */
export const WEDDING_INVITE_SLUG = "lemuelandgraziellewedding";

const WEDDING_INVITE_SLUG_ALIASES = new Set([
  "lemuelandgraziellewedding",
  "lemuel&graziellewedding",
  "lemuel-and-grazielle-wedding",
  "lemuel-grazielle-wedding",
]);

/** URL-safe guest segment from display name, e.g. "Mr. Reynaldo Lamela" → "mr-reynaldo-lamela". */
export function slugifyGuestName(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "guest";
}

export function isWeddingInviteSlug(value: string): boolean {
  return WEDDING_INVITE_SLUG_ALIASES.has(decodeURIComponent(value).trim().toLowerCase());
}
