import type { Metadata } from "next";
import { Armchair, Users, UserCheck } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SeatingBoard, type SeatingTableData, type SeatGuest } from "@/features/seating/components/seating-board";

export const metadata: Metadata = { title: "Seating" };

function guestName(g: { firstName: string; lastName: string; preferredName: string | null }) {
  return g.preferredName || `${g.firstName} ${g.lastName}`;
}

export default async function SeatingPage() {
  const { wedding } = await getCurrentWedding();

  const [tables, guests] = await Promise.all([
    db.seatingTable.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        assignments: {
          include: {
            guest: { select: { id: true, firstName: true, lastName: true, preferredName: true } },
          },
        },
      },
    }),
    db.guest.findMany({
      where: { weddingId: wedding.id, deletedAt: null, seatAssignment: null },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, preferredName: true },
    }),
  ]);

  const tableData: SeatingTableData[] = tables.map((t) => ({
    id: t.id,
    name: t.name,
    capacity: t.capacity,
    guests: t.assignments.map((a) => ({ id: a.guest.id, name: guestName(a.guest) })),
  }));

  const unassigned: SeatGuest[] = guests.map((g) => ({ id: g.id, name: guestName(g) }));

  const totalSeats = tableData.reduce((s, t) => s + t.capacity, 0);
  const seated = tableData.reduce((s, t) => s + t.guests.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Seating" description="Arrange your guests across tables" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tables" value={tableData.length} icon={Armchair} />
        <StatCard label="Seated" value={`${seated}/${totalSeats}`} icon={UserCheck} accent="success" />
        <StatCard label="Unassigned" value={unassigned.length} icon={Users} accent="warning" />
      </div>

      <SeatingBoard tables={tableData} unassigned={unassigned} />
    </div>
  );
}
