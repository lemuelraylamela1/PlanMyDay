import { z } from "zod";

export const publicCheckInLookupSchema = z.object({
  sessionToken: z.string().min(1),
});

export const publicCheckInSubmitSchema = z.object({
  sessionToken: z.string().min(1),
  guestCode: z.string().min(1),
});

export const checkInGuestIdSchema = z.object({
  guestId: z.string().uuid(),
});
