import { z } from "zod";

export const websiteSettingsSchema = z.object({
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  customDomain: z.string().max(200).optional().or(z.literal("")),
  passwordProtect: z.boolean().default(false),
  accessPassword: z.string().max(100).optional().or(z.literal("")),
});

export const sectionTypeEnum = z.enum([
  "HERO",
  "STORY",
  "TIMELINE",
  "GALLERY",
  "RSVP",
  "VENUE",
  "GIFT_REGISTRY",
  "FAQ",
  "COUNTDOWN",
  "MUSIC",
  "CONTACT",
  "CUSTOM",
]);

export type WebsiteSettingsInput = z.infer<typeof websiteSettingsSchema>;
