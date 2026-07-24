"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import {
  issueInvitationToken,
  getInvitationQrDataUrl,
} from "@/features/invitations/service";
import { submitRsvpForGuest } from "@/features/invitations/rsvp-service";

export async function generateInviteAction(
  guestId: string,
): Promise<ActionResult<{ url: string; qr: string }>> {
  const { wedding, user } = await getCurrentWedding();
  const guest = await db.guest.findFirst({
    where: { id: guestId, weddingId: wedding.id, deletedAt: null },
  });
  if (!guest) return fail("Guest not found.");

  const { url } = await issueInvitationToken(wedding.id, guestId);
  const qr = await getInvitationQrDataUrl(url);

  await db.guest.update({
    where: { id: guestId },
    data: { invitationStatus: guest.invitationStatus === "NOT_SENT" ? "SENT" : guest.invitationStatus },
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "INVITE",
    entityType: "Guest",
    entityId: guestId,
    summary: `Generated invitation for ${guest.firstName}`,
  });

  revalidatePath("/invitations");
  return ok({ url, qr });
}

/**
 * Public RSVP submission. Called from the tokenized invitation page.
 * Validated by token elsewhere; here we trust the resolved guest/wedding ids.
 */
export async function submitRsvpAction(input: {
  weddingId: string;
  guestId: string;
  attending: boolean;
  partySize: number;
  mealPreference?: string;
  dietaryRestrictions?: string;
  plusOneName?: string;
  message?: string;
}): Promise<ActionResult> {
  const result = await submitRsvpForGuest({
    weddingId: input.weddingId,
    guestId: input.guestId,
    attending: input.attending,
    partySize: input.partySize,
    mealPreference: input.mealPreference,
    dietaryRestrictions: input.dietaryRestrictions,
    plusOneName: input.plusOneName,
    message: input.message,
  });
  if (!result.ok) return fail(result.error);
  revalidatePath("/guests");
  revalidatePath("/dashboard");
  return ok(undefined, result.message);
}
