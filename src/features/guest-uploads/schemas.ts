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
