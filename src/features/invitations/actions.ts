"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/features/notifications/service";
import {
  issueInvitationToken,
  getInvitationQrDataUrl,
} from "@/features/invitations/service";

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
  const guest = await db.guest.findFirst({
    where: { id: input.guestId, weddingId: input.weddingId, deletedAt: null },
  });
  if (!guest) return fail("Invitation not found.");

  const status = input.attending ? "ACCEPTED" : "DECLINED";

  await db.$transaction([
    db.rsvpResponse.create({
      data: {
        weddingId: input.weddingId,
        guestId: input.guestId,
        status,
        attending: input.attending,
        partySize: Math.max(1, input.partySize),
        mealPreference: input.mealPreference || null,
        dietaryRestrictions: input.dietaryRestrictions || null,
        plusOneName: input.plusOneName || null,
        message: input.message || null,
      },
    }),
    db.guest.update({
      where: { id: input.guestId },
      data: {
        rsvpStatus: status,
        invitationStatus: "RESPONDED",
        mealPreference: input.mealPreference || guest.mealPreference,
        dietaryRestrictions: input.dietaryRestrictions || guest.dietaryRestrictions,
        plusOneName: input.plusOneName || guest.plusOneName,
      },
    }),
  ]);

  await logActivity({
    weddingId: input.weddingId,
    action: "RSVP_SUBMIT",
    entityType: "Guest",
    entityId: input.guestId,
    summary: `${guest.firstName} ${guest.lastName} ${input.attending ? "accepted" : "declined"} the invitation`,
  });

  await createNotification({
    weddingId: input.weddingId,
    type: "RSVP_UPDATE",
    title: "New RSVP received",
    body: `${guest.firstName} ${guest.lastName} ${input.attending ? "is attending" : "declined"}.`,
    link: "/guests",
  });

  revalidatePath("/guests");
  revalidatePath("/dashboard");
  return ok(undefined, "Thank you! Your RSVP has been recorded.");
}
