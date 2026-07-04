"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, ok } from "@/lib/action-result";

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.mediaAsset.updateMany({
    where: { id, weddingId: wedding.id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/media");
  return ok(undefined, "File deleted.");
}
