import "server-only";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { baseEmailTemplate, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/features/notifications/service";

type SubmitRsvpInput = {
  weddingId: string;
  guestId: string;
  attending: boolean;
  partySize: number;
  mealPreference?: string;
  dietaryRestrictions?: string;
  plusOneName?: string;
  message?: string;
  guestEmail?: string;
  actorUserId?: string;
};

function normalizeOptional(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function submitRsvpForGuest(input: SubmitRsvpInput): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const guest = await db.guest.findFirst({
    where: { id: input.guestId, weddingId: input.weddingId, deletedAt: null },
    include: { wedding: true },
  });
  if (!guest) return { ok: false, error: "Invitation not found." };

  const status = input.attending ? "ACCEPTED" : "DECLINED";
  const partySize = Math.max(1, input.partySize);
  const mealPreference = normalizeOptional(input.mealPreference);
  const dietaryRestrictions = normalizeOptional(input.dietaryRestrictions);
  const plusOneName = normalizeOptional(input.plusOneName);
  const message = normalizeOptional(input.message);
  const guestEmail = normalizeOptional(input.guestEmail);

  await db.$transaction([
    db.rsvpResponse.create({
      data: {
        weddingId: input.weddingId,
        guestId: input.guestId,
        status,
        attending: input.attending,
        partySize,
        mealPreference,
        dietaryRestrictions,
        plusOneName,
        message,
      },
    }),
    db.guest.update({
      where: { id: input.guestId },
      data: {
        rsvpStatus: status,
        invitationStatus: "SENT",
        email: guestEmail ?? guest.email,
        mealPreference: mealPreference ?? guest.mealPreference,
        dietaryRestrictions: dietaryRestrictions ?? guest.dietaryRestrictions,
        plusOneName: plusOneName ?? guest.plusOneName,
      },
    }),
    ...(input.attending ? [] : [db.seatAssignment.deleteMany({ where: { weddingId: input.weddingId, guestId: input.guestId } })]),
  ]);

  await logActivity({
    weddingId: input.weddingId,
    userId: input.actorUserId,
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

  const emailSubject = `RSVP update: ${guest.firstName} ${guest.lastName}`;
  const emailBody = `
    <p><strong>Guest:</strong> ${guest.firstName} ${guest.lastName}</p>
    <p><strong>Status:</strong> ${status}</p>
    <p><strong>Party size:</strong> ${partySize}</p>
    <p><strong>Email:</strong> ${guestEmail ?? guest.email ?? "Not provided"}</p>
    <p><strong>Meal preference:</strong> ${mealPreference ?? "Not specified"}</p>
    <p><strong>Message:</strong> ${message ?? "None"}</p>
    <p><strong>Wedding:</strong> ${guest.wedding.title}</p>
  `;

  const mailResult = await sendEmail({
    to: env.rsvpNotificationEmail,
    subject: emailSubject,
    html: baseEmailTemplate("New RSVP response", emailBody),
    text: `${guest.firstName} ${guest.lastName} responded ${status}. Party size: ${partySize}.`,
  });

  await db.emailDeliveryLog.create({
    data: {
      weddingId: input.weddingId,
      guestId: input.guestId,
      toEmail: env.rsvpNotificationEmail,
      subject: emailSubject,
      status: mailResult.ok ? "SENT" : "FAILED",
      error: mailResult.ok ? null : mailResult.error,
      sentAt: mailResult.ok ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/guests");
  revalidatePath("/invitations");
  revalidatePath("/seating");

  return { ok: true, message: "Thank you! Your RSVP has been recorded." };
}
