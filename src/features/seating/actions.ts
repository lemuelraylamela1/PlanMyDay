"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { tableSchema } from "@/features/seating/schemas";

export async function saveTableAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string } | undefined>> {
  const { wedding } = await getCurrentWedding();
  const parsed = tableSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;
  if (id) {
    const res = await db.seatingTable.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data: { name: d.name, capacity: d.capacity, shape: d.shape },
    });
    if (res.count === 0) return fail("Table not found.");
    revalidatePath("/seating");
    return ok(undefined, "Table saved.");
  } else {
    const created = await db.seatingTable.create({
      data: { weddingId: wedding.id, name: d.name, capacity: d.capacity, shape: d.shape },
    });
    revalidatePath("/seating");
    return ok({ id: created.id }, "Table saved.");
  }
}

export async function deleteTableAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.$transaction([
    db.seatAssignment.deleteMany({ where: { tableId: id, weddingId: wedding.id } }),
    db.seatingTable.updateMany({
      where: { id, weddingId: wedding.id },
      data: { deletedAt: new Date() },
    }),
  ]);
  revalidatePath("/seating");
  return ok(undefined, "Table deleted.");
}

export async function assignGuestAction(guestId: string, tableId: string): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();

  const [guest, table] = await Promise.all([
    db.guest.findFirst({ where: { id: guestId, weddingId: wedding.id, deletedAt: null } }),
    db.seatingTable.findFirst({ where: { id: tableId, weddingId: wedding.id, deletedAt: null } }),
  ]);
  if (!guest || !table) return fail("Guest or table not found.");

  const seated = await db.seatAssignment.count({
    where: { tableId, weddingId: wedding.id, NOT: { guestId } },
  });
  if (seated >= table.capacity) {
    return fail(`${table.name} is at full capacity.`);
  }

  await db.seatAssignment.upsert({
    where: { guestId },
    create: { weddingId: wedding.id, tableId, guestId },
    update: { tableId },
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "SeatAssignment",
    summary: `Seated ${guest.firstName} at ${table.name}`,
  });

  revalidatePath("/seating");
  return ok();
}

export async function unassignGuestAction(guestId: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.seatAssignment.deleteMany({ where: { guestId, weddingId: wedding.id } });
  revalidatePath("/seating");
  return ok();
}
