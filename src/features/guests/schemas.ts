import { z } from "zod";

import { GUEST_TITLE_OPTIONS } from "@/features/guests/display-name";

export const guestSideEnum = z.enum(["BRIDE", "GROOM", "BOTH"]);
export const rsvpStatusEnum = z.enum(["PENDING", "ACCEPTED", "DECLINED", "TENTATIVE"]);
export const invitationStatusEnum = z.enum(["NOT_SENT", "SENT", "OPENED", "RESPONDED"]);
export const guestTitleEnum = z.enum(GUEST_TITLE_OPTIONS);

export const guestSchema = z.object({
  title: guestTitleEnum.optional().or(z.literal("")),
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  preferredName: z.string().max(80).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  facebookLink: z
    .string()
    .trim()
    .max(500, "Facebook link is too long.")
    .optional()
    .or(z.literal("")),
  side: guestSideEnum.default("BOTH"),
  relationship: z.string().max(80).optional().or(z.literal("")),
  rsvpStatus: rsvpStatusEnum.default("PENDING"),
  mealPreference: z.string().max(120).optional().or(z.literal("")),
  dietaryRestrictions: z.string().max(240).optional().or(z.literal("")),
  plusOneAllowed: z.boolean().default(false),
  plusOneName: z.string().max(120).optional().or(z.literal("")),
  groupId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const guestSortFields = [
  "name",
  "title",
  "side",
  "group",
  "rsvpStatus",
  "invitationStatus",
  "facebook",
] as const;

export const guestSortFieldSchema = z.enum(guestSortFields);
export type GuestSortField = z.infer<typeof guestSortFieldSchema>;

export const guestFilterSchema = z.object({
  q: z.string().optional(),
  side: guestSideEnum.optional(),
  rsvpStatus: rsvpStatusEnum.optional(),
  sortBy: guestSortFieldSchema.optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .refine((value): value is 10 | 50 | 100 => value === 10 || value === 50 || value === 100)
    .default(10),
});

export type GuestInput = z.infer<typeof guestSchema>;
export type GuestFilter = z.infer<typeof guestFilterSchema>;

/** Ensure pasted profile URLs open correctly. */
export function normalizeExternalUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
