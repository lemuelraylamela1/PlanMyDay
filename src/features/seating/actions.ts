"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { tableSchema } from "@/features/seating/schemas";
import { occupiedSeats, partySize } from "@/features/seating/model";

const guestIdSchema = z.string().uuid();
const guestIdListSchema = z.array(guestIdSchema).min(1).max(50);

export async function saveTableAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string } | undefined>> {
  const { wedding } = await getCurrentWedding();
  const parsed = tableSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const data = parsed.data;
  if (id) {
    const res = await db.seatingTable.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data: { name: data.name, capacity: data.capacity, shape: data.shape },
    });
    if (res.count === 0) return fail("Table not found.");
    revalidatePath("/seating");
    return ok(undefined, "Table saved.");
  }

  const created = await db.seatingTable.create({
    data: {
      weddingId: wedding.id,
      name: data.name,
      capacity: data.capacity,
      shape: data.shape,
    },
  });
  revalidatePath("/seating");
  return ok({ id: created.id }, "Table saved.");
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

async function seatGuests(
  weddingId: string,
  userId: string,
  guestIds: string[],
  tableId: string,
): Promise<ActionResult> {
  const uniqueIds = [...new Set(guestIds)];
  const [guests, table] = await Promise.all([
    db.guest.findMany({
      where: { id: { in: uniqueIds }, weddingId, deletedAt: null },
      select: { id: true, firstName: true, rsvpStatus: true, plusOneName: true },
    }),
    db.seatingTable.findFirst({
      where: { id: tableId, weddingId, deletedAt: null },
    }),
  ]);

  if (!table || guests.length !== uniqueIds.length) return fail("Guest or table not found.");
  if (guests.some((guest) => guest.rsvpStatus !== "ACCEPTED")) {
    return fail("Only accepted guests can be assigned to a table.");
  }

  const incoming = occupiedSeats(guests);
  const existing = await db.seatAssignment.findMany({
    where: {
      tableId,
      weddingId,
      guestId: { notIn: uniqueIds },
      guest: { deletedAt: null },
    },
    select: { guest: { select: { plusOneName: true } } },
  });
  const open = table.capacity - occupiedSeats(existing.map((row) => row.guest));
  if (incoming > open) {
    if (open <= 0) return fail(`${table.name} is at full capacity.`);
    return fail(
      `${table.name} has ${open} open ${open === 1 ? "seat" : "seats"}, and this seating needs ${incoming}.`,
    );
  }

  await db.$transaction(
    guests.map((guest) =>
      db.seatAssignment.upsert({
        where: { guestId: guest.id },
        create: { weddingId, tableId, guestId: guest.id },
        update: { tableId },
      }),
    ),
  );

  await logActivity({
    weddingId,
    userId,
    action: "UPDATE",
    entityType: "SeatAssignment",
    entityId: tableId,
    summary:
      guests.length === 1
        ? `Seated ${guests[0]?.firstName ?? "a guest"} at ${table.name}`
        : `Seated ${guests.length} guests at ${table.name}`,
  });

  revalidatePath("/seating");
  const message =
    guests.length === 1
      ? `Seated ${guests[0]?.firstName ?? "guest"} at ${table.name}.`
      : `Seated ${guests.length} guests at ${table.name}.`;
  return ok(undefined, message);
}

export async function assignGuestAction(guestId: string, tableId: string): Promise<ActionResult> {
  if (!guestIdSchema.safeParse(guestId).success || !guestIdSchema.safeParse(tableId).success) {
    return fail("Guest or table not found.");
  }
  const { wedding, user } = await getCurrentWedding();
  return seatGuests(wedding.id, user.id, [guestId], tableId);
}

export async function assignGuestsAction(
  guestIds: string[],
  tableId: string,
): Promise<ActionResult> {
  const parsedIds = guestIdListSchema.safeParse(guestIds);
  if (!parsedIds.success || !guestIdSchema.safeParse(tableId).success) {
    return fail("Choose a table and at least one guest.");
  }
  const { wedding, user } = await getCurrentWedding();
  return seatGuests(wedding.id, user.id, parsedIds.data, tableId);
}

export async function unassignGuestAction(guestId: string): Promise<ActionResult> {
  if (!guestIdSchema.safeParse(guestId).success) return fail("Guest not found.");
  const { wedding } = await getCurrentWedding();
  const guest = await db.guest.findFirst({
    where: { id: guestId, weddingId: wedding.id, deletedAt: null },
    select: { firstName: true },
  });
  await db.seatAssignment.deleteMany({ where: { guestId, weddingId: wedding.id } });
  revalidatePath("/seating");
  return ok(
    undefined,
    guest ? `${guest.firstName} is back with the unassigned guests.` : "Guest unassigned.",
  );
}
