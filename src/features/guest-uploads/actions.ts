"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { getGuestMediaStorage } from "@/lib/guest-media-storage";
import {
  getUploadQrDataUrl,
  issueUploadToken,
  regenerateUploadToken,
  setUploadEnabled,
} from "@/features/guest-uploads/service";
import { publishGuestUploadEvent } from "@/lib/guest-upload-events";

async function assertOwner() {
  const { wedding, user } = await getCurrentWedding();
  await requireWeddingOwner(wedding.id);
  return { wedding, user };
}

export async function generateUploadLinkAction(): Promise<ActionResult<{ url: string; qr: string }>> {
  const { wedding, user } = await assertOwner();
  const { url } = await issueUploadToken(wedding.id);
  const qr = await getUploadQrDataUrl(url);

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "GuestUploadToken",
    entityId: wedding.id,
    summary: "Generated guest upload link",
  });

  revalidatePath("/guest-uploads");
  return ok({ url, qr });
}

export async function regenerateUploadLinkAction(): Promise<ActionResult<{ url: string; qr: string }>> {
  const { wedding, user } = await assertOwner();
  const { url } = await regenerateUploadToken(wedding.id);
  const qr = await getUploadQrDataUrl(url);

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "GuestUploadToken",
    entityId: wedding.id,
    summary: "Regenerated guest upload link",
  });

  revalidatePath("/guest-uploads");
  return ok({ url, qr });
}

export async function setUploadEnabledAction(enabled: boolean): Promise<ActionResult> {
  const { wedding, user } = await assertOwner();

  const existing = await db.guestUploadToken.findUnique({ where: { weddingId: wedding.id } });
  if (!existing) {
    await issueUploadToken(wedding.id);
  }

  await setUploadEnabled(wedding.id, enabled);

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "GuestUploadToken",
    entityId: wedding.id,
    summary: enabled ? "Enabled guest uploads" : "Closed guest uploads",
  });

  revalidatePath("/guest-uploads");
  return ok(undefined, enabled ? "Guest uploads are now open." : "Guest uploads are now closed.");
}

export async function deleteGuestUploadAction(id: string): Promise<ActionResult> {
  const { wedding, user } = await assertOwner();

  const upload = await db.guestMediaUpload.findFirst({
    where: { id, weddingId: wedding.id, deletedAt: null },
  });
  if (!upload) return fail("Upload not found.");

  try {
    await getGuestMediaStorage().delete(upload.fileId);
  } catch {
    // Continue soft-delete even if Drive file is already gone.
  }

  await db.guestMediaUpload.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "DELETE",
    entityType: "GuestMediaUpload",
    entityId: id,
    summary: `Deleted guest upload from ${upload.guestName}`,
  });

  publishGuestUploadEvent(wedding.id, "deleted");

  revalidatePath("/guest-uploads");
  return ok(undefined, "Upload deleted.");
}
