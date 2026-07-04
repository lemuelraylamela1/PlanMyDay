import { formatDate } from "@/lib/utils";

/**
 * Extensible invitation template engine.
 *
 * Placeholders use the `{{key}}` syntax. New placeholders are added by
 * registering a provider here — existing saved templates never need to change.
 */
export interface PlaceholderContext {
  guest: {
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    plusOneAllowed: boolean;
    plusOneName?: string | null;
    mealPreference?: string | null;
  };
  wedding: {
    title: string;
    partner1Name?: string | null;
    partner2Name?: string | null;
    date?: Date | null;
    ceremonyTime?: Date | null;
    receptionTime?: Date | null;
    venueName?: string | null;
    venueAddress?: string | null;
    rsvpDeadline?: Date | null;
  };
  seat?: {
    tableName?: string | null;
    seatNumber?: number | null;
  };
  invitationUrl?: string;
}

type PlaceholderProvider = (ctx: PlaceholderContext) => string;

function time(value?: Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

const registry = new Map<string, PlaceholderProvider>();

/** Register a new placeholder provider. Safe to call at module load. */
export function registerPlaceholder(key: string, provider: PlaceholderProvider) {
  registry.set(key.toLowerCase(), provider);
}

registerPlaceholder("guestName", (c) => c.guest.preferredName || c.guest.firstName);
registerPlaceholder("guestFullName", (c) => `${c.guest.firstName} ${c.guest.lastName}`);
registerPlaceholder(
  "coupleNames",
  (c) =>
    [c.wedding.partner1Name, c.wedding.partner2Name].filter(Boolean).join(" & ") || c.wedding.title,
);
registerPlaceholder("weddingTitle", (c) => c.wedding.title);
registerPlaceholder("weddingDate", (c) => formatDate(c.wedding.date));
registerPlaceholder("ceremonyTime", (c) => time(c.wedding.ceremonyTime));
registerPlaceholder("receptionTime", (c) => time(c.wedding.receptionTime));
registerPlaceholder("venue", (c) => c.wedding.venueName ?? "");
registerPlaceholder("venueAddress", (c) => c.wedding.venueAddress ?? "");
registerPlaceholder("tableName", (c) => c.seat?.tableName ?? "");
registerPlaceholder("seatNumber", (c) => (c.seat?.seatNumber ? String(c.seat.seatNumber) : ""));
registerPlaceholder("plusOne", (c) =>
  c.guest.plusOneAllowed ? c.guest.plusOneName || "and guest" : "",
);
registerPlaceholder("rsvpDeadline", (c) => formatDate(c.wedding.rsvpDeadline));
registerPlaceholder("invitationUrl", (c) => c.invitationUrl ?? "");

/** Replaces every `{{placeholder}}` in a template using the registry. */
export function renderTemplate(template: string, ctx: PlaceholderContext): string {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (match, key: string) => {
    const provider = registry.get(key.toLowerCase());
    return provider ? provider(ctx) : match;
  });
}

/** Lists all registered placeholder keys (for template editor hints). */
export function availablePlaceholders(): string[] {
  return Array.from(registry.keys());
}
