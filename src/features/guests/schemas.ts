import { z } from "zod";

export const guestSideEnum = z.enum(["BRIDE", "GROOM", "BOTH"]);
export const rsvpStatusEnum = z.enum(["PENDING", "ACCEPTED", "DECLINED", "TENTATIVE"]);
export const invitationStatusEnum = z.enum(["NOT_SENT", "SENT", "OPENED", "RESPONDED"]);

export const guestSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  preferredName: z.string().max(80).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
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

export const guestFilterSchema = z.object({
  q: z.string().optional(),
  side: guestSideEnum.optional(),
  rsvpStatus: rsvpStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
});

export type GuestInput = z.infer<typeof guestSchema>;
export type GuestFilter = z.infer<typeof guestFilterSchema>;
