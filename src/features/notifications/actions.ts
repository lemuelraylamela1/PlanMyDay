"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, ok } from "@/lib/action-result";

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.notification.updateMany({
    where: { id, weddingId: wedding.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  return ok();
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  await db.notification.updateMany({
    where: { weddingId: wedding.id, readAt: null, OR: [{ userId: user.id }, { userId: null }] },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  return ok(undefined, "All caught up!");
}
