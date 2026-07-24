import type { Metadata } from "next";

import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { listGuests, getGuestStats, listGuestGroups } from "@/features/guests/service";
import { guestFilterSchema } from "@/features/guests/schemas";
import { GuestsTable, type GuestRow } from "@/features/guests/components/guests-table";

export const metadata: Metadata = { title: "Guests" };

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { wedding } = await getCurrentWedding();
  const sp = await searchParams;
  const filter = guestFilterSchema.parse({
    q: sp.q,
    side: sp.side,
    rsvpStatus: sp.rsvpStatus,
    page: sp.page ?? 1,
    pageSize: 20,
  });

  const [{ items, total, page, totalPages }, stats, groups] = await Promise.all([
    listGuests(wedding.id, filter),
    getGuestStats(wedding.id),
    listGuestGroups(wedding.id),
  ]);

  const rows: GuestRow[] = items.map((g) => ({
    id: g.id,
    title: g.title,
    firstName: g.firstName,
    lastName: g.lastName,
    preferredName: g.preferredName,
    email: g.email,
    phone: g.phone,
    side: g.side,
    relationship: g.relationship,
    rsvpStatus: g.rsvpStatus,
    invitationStatus: g.invitationStatus === "NOT_SENT" ? "NOT_SENT" : "SENT",
    mealPreference: g.mealPreference,
    dietaryRestrictions: g.dietaryRestrictions,
    plusOneAllowed: g.plusOneAllowed,
    plusOneName: g.plusOneName,
    notes: g.notes,
    groupId: g.groupId,
    groupName: g.group?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Guests" description="Manage your guest list, RSVPs and invitations" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={Users} />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle2} accent="success" />
        <StatCard label="Declined" value={stats.declined} icon={XCircle} accent="destructive" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} accent="warning" />
      </div>

      <GuestsTable
        guests={rows}
        groups={groups}
        page={page}
        totalPages={totalPages}
        total={total}
        filter={{ q: filter.q, side: filter.side, rsvpStatus: filter.rsvpStatus }}
      />
    </div>
  );
}
