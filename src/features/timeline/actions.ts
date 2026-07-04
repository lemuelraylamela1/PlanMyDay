"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { timelineEventSchema } from "@/features/timeline/schemas";

function clean(v?: string | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}
function toDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function saveTimelineEventAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = timelineEventSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;
  const start = toDate(d.startTime);
  if (!start) return fail("Enter a valid start time.");

  const data = {
    title: d.title,
    description: clean(d.description),
    location: clean(d.location),
    startTime: start,
    endTime: toDate(d.endTime),
  };

  if (id) {
    const res = await db.timelineEvent.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data,
    });
    if (res.count === 0) return fail("Event not found.");
  } else {
    await db.timelineEvent.create({ data: { ...data, weddingId: wedding.id } });
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entityType: "TimelineEvent",
    entityId: id ?? undefined,
    summary: `${id ? "Updated" : "Added"} timeline event ${d.title}`,
  });

  revalidatePath("/timeline");
  return ok(undefined, "Event saved.");
}

export async function deleteTimelineEventAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.timelineEvent.updateMany({
    where: { id, weddingId: wedding.id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/timeline");
  return ok(undefined, "Event deleted.");
}
