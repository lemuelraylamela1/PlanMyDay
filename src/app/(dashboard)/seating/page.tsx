import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { SeatingBoard } from "@/features/seating/components/seating-board";
import {
  asTableShape,
  compareGuests,
  toSeatGuest,
  type SeatGuest,
  type SeatingTableData,
} from "@/features/seating/model";

export const metadata: Metadata = { title: "Seating" };

const guestFields = {
  id: true,
  title: true,
  firstName: true,
  lastName: true,
  preferredName: true,
  side: true,
  rsvpStatus: true,
  mealPreference: true,
  dietaryRestrictions: true,
  plusOneName: true,
  groupId: true,
  deletedAt: true,
  group: { select: { name: true, deletedAt: true } },
} as const;

export default async function SeatingPage() {
  const { wedding } = await getCurrentWedding();

  const [tables, guests, pendingCount] = await Promise.all([
    db.seatingTable.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        assignments: {
          include: { guest: { select: guestFields } },
        },
      },
    }),
    db.guest.findMany({
      where: {
        weddingId: wedding.id,
        deletedAt: null,
        seatAssignment: null,
        rsvpStatus: "ACCEPTED",
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: guestFields,
    }),
    db.guest.count({
      where: {
        weddingId: wedding.id,
        deletedAt: null,
        rsvpStatus: { in: ["PENDING", "TENTATIVE"] },
      },
    }),
  ]);

  const tableData: SeatingTableData[] = tables.map((table) => ({
    id: table.id,
    name: table.name,
    capacity: table.capacity,
    shape: asTableShape(table.shape),
    guests: table.assignments
      .map((assignment) => assignment.guest)
      .filter((guest) => guest.deletedAt == null)
      .map((guest) => toSeatGuest(guest))
      .sort(compareGuests),
  }));

  const unassigned: SeatGuest[] = guests.map((guest) => toSeatGuest(guest)).sort(compareGuests);

  return (
    <div className="space-y-6">
      <PageHeader
        className="mb-0"
        title="Seating"
        description="Arrange accepted guests at each table. Named plus ones take a seat beside their host."
      />

      {pendingCount > 0 && (
        <p className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          {pendingCount === 1
            ? "1 guest is pending or tentative and will show up here after accepting."
            : `${pendingCount} guests are pending or tentative and will show up here after accepting.`}
        </p>
      )}

      <SeatingBoard tables={tableData} unassigned={unassigned} weddingTitle={wedding.title} />
    </div>
  );
}
