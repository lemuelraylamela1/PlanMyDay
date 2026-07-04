import { z } from "zod";

export const createWeddingSchema = z.object({
  title: z.string().min(2, "Give your wedding a title").max(120),
  partner1Name: z.string().max(80).optional().or(z.literal("")),
  partner2Name: z.string().max(80).optional().or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
});

export const updateWeddingSchema = z.object({
  title: z.string().min(2).max(120),
  subtitle: z.string().max(160).optional().or(z.literal("")),
  partner1Name: z.string().max(80).optional().or(z.literal("")),
  partner2Name: z.string().max(80).optional().or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
  ceremonyTime: z.string().optional().or(z.literal("")),
  receptionTime: z.string().optional().or(z.literal("")),
  venueName: z.string().max(160).optional().or(z.literal("")),
  venueAddress: z.string().max(300).optional().or(z.literal("")),
  currency: z.string().min(3).max(3).default("USD"),
  timezone: z.string().default("UTC"),
  rsvpDeadline: z.string().optional().or(z.literal("")),
});

export const weddingSettingsSchema = z.object({
  dressCode: z.string().max(160).optional().or(z.literal("")),
  story: z.string().max(5000).optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
  themeKey: z.string().default("classic"),
  primaryColor: z.string().max(9).default("#b03a5b"),
  secondaryColor: z.string().max(9).default("#f4e6ea"),
  fontHeading: z.string().default("Playfair Display"),
  fontBody: z.string().default("Inter"),
});

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
export type WeddingSettingsInput = z.infer<typeof weddingSettingsSchema>;
