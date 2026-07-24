import type { Metadata } from "next";
import Link from "next/link";
import { MailOpen, Send, MessageSquare, Mail } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { InvitationsManager, type InviteGuestRow } from "@/features/invitations/components/invitations-manager";
import { formatGuestDisplayName } from "@/features/guests/display-name";

export const metadata: Metadata = { title: "Invitations & RSVP" };

export default async function InvitationsPage() {
  const { wedding } = await getCurrentWedding();

  const guests = await db.guest.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { invitationToken: { select: { id: true } } },
  });

  const rows: InviteGuestRow[] = guests.map((g) => ({
    id: g.id,
    name: formatGuestDisplayName(g),
    email: g.email,
    invitationStatus: g.invitationStatus === "NOT_SENT" ? "NOT_SENT" : "SENT",
    rsvpStatus: g.rsvpStatus,
    hasToken: Boolean(g.invitationToken),
  }));

  const sent = rows.filter((r) => r.invitationStatus === "SENT").length;
  const responded = rows.filter((r) => r.rsvpStatus !== "PENDING").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitations & RSVP"
        description="Generate personalized, secure invitation links and track responses"
      >
        <Button variant="outline" asChild>
          <Link href="/invitations/email">
            <Mail className="h-4 w-4" /> Email templates
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Guests" value={rows.length} icon={MailOpen} />
        <StatCard label="Invited" value={sent} icon={Send} accent="info" />
        <StatCard label="Responded" value={responded} icon={MessageSquare} accent="success" />
      </div>

      <InvitationsManager guests={rows} />
    </div>
  );
}
