"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { formatGuestDisplayName } from "@/features/guests/display-name";
import { tableSchema } from "@/features/seating/schemas";
import { allocateSeatNumbers, occupiedSeats, partySize } from "@/features/seating/model";

const guestIdSchema = z.string().uuid();
const guestIdListSchema = z.array(guestIdSchema).min(1).max(50);
const seatListSchema = z
  .array(
    z.object({
      guestId: guestIdSchema,
      seatNumber: z.number().int().min(0).max(49),
    }),
  )
  .min(1)
  .max(50);

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
        create: { weddingId, tableId, guestId: guest.id, seatNumber: null },
        update: { tableId, seatNumber: null },
      }),
    ),
  );
  await persistSeatNumbers(weddingId, tableId, table.capacity);

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

async function writeSeatNumbers(
  weddingId: string,
  tableId: string,
  seats: { guestId: string; seatNumber: number }[],
) {
  await db.$transaction(async (tx) => {
    await tx.seatAssignment.updateMany({
      where: { weddingId, tableId, guestId: { in: seats.map((seat) => seat.guestId) } },
      data: { seatNumber: null },
    });
    for (const seat of seats) {
      await tx.seatAssignment.updateMany({
        where: { weddingId, tableId, guestId: seat.guestId },
        data: { seatNumber: seat.seatNumber },
      });
    }
  });
}

async function persistSeatNumbers(weddingId: string, tableId: string, capacity: number) {
  const rows = await db.seatAssignment.findMany({
    where: { tableId, weddingId, guest: { deletedAt: null } },
    select: {
      guestId: true,
      seatNumber: true,
      guest: {
        select: {
          plusOneName: true,
          title: true,
          firstName: true,
          lastName: true,
          preferredName: true,
        },
      },
    },
  });
  if (rows.length === 0) return;
  const seats = allocateSeatNumbers(
    rows.map((row) => ({
      id: row.guestId,
      name: formatGuestDisplayName(row.guest),
      plusOneName: row.guest.plusOneName,
      seatNumber: row.seatNumber,
    })),
    capacity,
  ).map((seat) => ({ guestId: seat.id, seatNumber: seat.seatNumber }));
  try {
    await writeSeatNumbers(weddingId, tableId, seats);
  } catch (error) {
    console.error("Failed to save seat numbers", error);
  }
}

export async function reorderSeatsAction(
  tableId: string,
  seats: { guestId: string; seatNumber: number }[],
): Promise<ActionResult> {
  const parsed = seatListSchema.safeParse(seats);
  if (!parsed.success || !guestIdSchema.safeParse(tableId).success) {
    return fail("Those seats could not be saved.");
  }
  const { wedding, user } = await getCurrentWedding();
  const table = await db.seatingTable.findFirst({
    where: { id: tableId, weddingId: wedding.id, deletedAt: null },
  });
  if (!table) return fail("Table not found.");

  const assignments = await db.seatAssignment.findMany({
    where: { tableId, weddingId: wedding.id, guest: { deletedAt: null } },
    select: { guestId: true, guest: { select: { plusOneName: true, firstName: true } } },
  });
  const byId = new Map(assignments.map((assignment) => [assignment.guestId, assignment]));
  const uniqueIds = new Set(parsed.data.map((seat) => seat.guestId));
  if (uniqueIds.size !== parsed.data.length || uniqueIds.size !== assignments.length) {
    return fail("Refresh the page and try that seat again.");
  }

  const ranges: { start: number; end: number }[] = [];
  for (const seat of parsed.data) {
    const assignment = byId.get(seat.guestId);
    if (!assignment) return fail("Guest or table not found.");
    const size = partySize(assignment.guest);
    const end = seat.seatNumber + size;
    if (ranges.some((range) => seat.seatNumber < range.end && end > range.start)) {
      return fail("Those seats overlap.");
    }
    ranges.push({ start: seat.seatNumber, end });
  }

  try {
    await writeSeatNumbers(wedding.id, tableId, parsed.data);
  } catch {
    return fail("Those seats could not be saved.");
  }
  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "SeatAssignment",
    entityId: tableId,
    summary: `Rearranged seats at ${table.name}`,
  });
  revalidatePath("/seating");
  return ok();
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
