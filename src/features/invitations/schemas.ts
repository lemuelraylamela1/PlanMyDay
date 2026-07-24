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
    message: z.string().trim().max(500).optional(),
  })
  .refine((payload) => payload.attending === "no" || Boolean(payload.meal), {
    message: "Meal preference is required when attending.",
    path: ["meal"],
  });

export type PublicRsvpSubmitInput = z.infer<typeof publicRsvpSubmitSchema>;
