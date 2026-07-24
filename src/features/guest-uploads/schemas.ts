import { z } from "zod";

import { sanitizeTextInput } from "@/lib/guest-media-storage/validation";

export const guestUploadFormSchema = z.object({
  guestName: z
    .string()
    .transform((v) => sanitizeTextInput(v, 100))
    .pipe(z.string().min(1, "Please enter your name.").max(100, "Name must be 100 characters or less.")),
  message: z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeTextInput(v, 500) : undefined)),
});

export type GuestUploadFormInput = z.infer<typeof guestUploadFormSchema>;

export const guestUploadApiSchema = z.object({
  token: z.string().min(1),
  guestName: z
    .string()
    .transform((v) => sanitizeTextInput(v, 100))
    .pipe(z.string().min(1).max(100)),
  message: z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeTextInput(v, 500) : undefined)),
});

export const guestUploadSortFields = ["uploadedAt", "guestName", "mediaType", "fileName"] as const;
export type GuestUploadSortField = (typeof guestUploadSortFields)[number];

export const guestUploadListSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  sort: z.enum(guestUploadSortFields).default("uploadedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  mediaType: z.enum(["IMAGE", "VIDEO", "all"]).optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(10),
});

export type GuestUploadListFilter = z.infer<typeof guestUploadListSchema>;
