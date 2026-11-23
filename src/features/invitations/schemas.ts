import { z } from "zod";

const tokenSchema = z.string().trim().min(12).max(256);

export const publicRsvpLookupSchema = z.object({
  token: tokenSchema,
});

export const publicRsvpSubmitSchema = z
  .object({
    token: tokenSchema,
    email: z.string().trim().email().max(240),
    attending: z.enum(["yes", "no"]),
    guestCount: z.coerce.number().int().min(1).max(20),
    meal: z.string().trim().max(120).optional(),
    message: z.string().trim().max(6000).optional(),
  })
  .refine((payload) => payload.attending === "no" || Boolean(payload.meal), {
    message: "Meal preference is required when attending.",
    path: ["meal"],
  });

export type PublicRsvpSubmitInput = z.infer<typeof publicRsvpSubmitSchema>;

/** Same-origin invite page (`/invite/[token]`) — no guest email required. */
export const invitationRsvpSubmitSchema = z.object({
  token: tokenSchema,
  attending: z.boolean(),
  partySize: z.coerce.number().int().min(1).max(20).default(1),
  mealPreference: z.string().trim().max(1000).optional(),
  dietaryRestrictions: z.string().trim().max(1000).optional(),
  plusOneName: z.string().trim().max(200).optional(),
  // Note + "Suggested hashtags: …" are joined into this one field. Any
  // character is allowed (numbers, symbols, emoji, non-Latin scripts).
  message: z.string().trim().max(6000, "Your message is too long.").optional(),
});

export type InvitationRsvpSubmitInput = z.infer<typeof invitationRsvpSubmitSchema>;
