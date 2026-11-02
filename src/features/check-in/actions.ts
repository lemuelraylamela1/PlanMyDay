"use server";

import { revalidatePath } from "next/cache";

import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import {
  ensureGuestCheckInCredential,
  getCheckInQrDataUrl,
  issueCheckInSessionToken,
  regenerateCheckInSessionToken,
  regenerateGuestCheckInCredential,
  setCheckInSessionEnabled,
  undoGuestCheckIn,
  checkInSessionUrl,
} from "@/features/check-in/service";
import { checkInGuestIdSchema } from "@/features/check-in/schemas";

async function assertOwner() {
  const { wedding, user } = await getCurrentWedding();
  await requireWeddingOwner(wedding.id);
  return { wedding, user };
}

export async function generateCheckInLinkAction(): Promise<ActionResult<{ url: string; qr: string }>> {
  const { wedding, user } = await assertOwner();
  const { url } = await issueCheckInSessionToken(wedding.id);
  const qr = await getCheckInQrDataUrl(url);

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "CheckInSessionToken",
    entityId: wedding.id,
    summary: "Generated guest check-in scanner link",
  });

  revalidatePath("/check-in");
  return ok({ url, qr });
}

export async function regenerateCheckInLinkAction(): Promise<ActionResult<{ url: string; qr: string }>> {
  const { wedding, user } = await assertOwner();
  const { url } = await regenerateCheckInSessionToken(wedding.id);
  const qr = await getCheckInQrDataUrl(url);

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "CheckInSessionToken",
    entityId: wedding.id,
    summary: "Regenerated guest check-in scanner link",
  });

  revalidatePath("/check-in");
  return ok({ url, qr });
}

export async function setCheckInEnabledAction(enabled: boolean): Promise<ActionResult> {
  const { wedding, user } = await assertOwner();
  await setCheckInSessionEnabled(wedding.id, enabled);

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "CheckInSessionToken",
    entityId: wedding.id,
    summary: enabled ? "Enabled guest check-in" : "Disabled guest check-in",
  });

  revalidatePath("/check-in");
  return ok(undefined, enabled ? "Check-in is now open." : "Check-in is now closed.");
}

export async function getGuestCheckInQrAction(
  guestId: string,
): Promise<ActionResult<{ qrDataUrl: string; fullName: string }>> {
  const parsed = checkInGuestIdSchema.safeParse({ guestId });
  if (!parsed.success) return fail("Invalid guest.");

  const { wedding, user } = await assertOwner();
  const credential = await ensureGuestCheckInCredential(parsed.data.guestId);
  if (!credential || credential.guest.weddingId !== wedding.id) {
    return fail("QR is only available for accepted guests.");
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "Guest",
    entityId: guestId,
    summary: `Issued check-in QR for ${credential.fullName}`,
  });

  revalidatePath("/check-in");
  revalidatePath("/guests");
  return ok({ qrDataUrl: credential.qrDataUrl, fullName: credential.fullName });
}

export async function regenerateGuestCheckInQrAction(
  guestId: string,
): Promise<ActionResult<{ qrDataUrl: string; fullName: string }>> {
  const parsed = checkInGuestIdSchema.safeParse({ guestId });
  if (!parsed.success) return fail("Invalid guest.");

  const { wedding, user } = await assertOwner();
  const credential = await regenerateGuestCheckInCredential(parsed.data.guestId);
  if (!credential || credential.guest.weddingId !== wedding.id) {
    return fail("QR is only available for accepted guests.");
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "Guest",
    entityId: guestId,
    summary: `Regenerated check-in QR for ${credential.fullName}`,
  });

  revalidatePath("/check-in");
  revalidatePath("/guests");
  return ok({ qrDataUrl: credential.qrDataUrl, fullName: credential.fullName });
}

export async function undoGuestCheckInAction(guestId: string): Promise<ActionResult> {
  const parsed = checkInGuestIdSchema.safeParse({ guestId });
  if (!parsed.success) return fail("Invalid guest.");

  const { wedding, user } = await assertOwner();
  const updated = await undoGuestCheckIn(wedding.id, parsed.data.guestId);
  if (!updated) return fail("Guest not found.");

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "Guest",
    entityId: guestId,
    summary: `Cleared arrival for ${updated.firstName} ${updated.lastName}`,
  });

  revalidatePath("/check-in");
  revalidatePath("/guests");
  return ok(undefined, "Arrival cleared.");
}

export async function ensureCheckInLinkExistsAction(): Promise<ActionResult<{ url: string }>> {
  const { wedding } = await assertOwner();
  const { token } = await issueCheckInSessionToken(wedding.id);
  return ok({ url: checkInSessionUrl(token) });
}
