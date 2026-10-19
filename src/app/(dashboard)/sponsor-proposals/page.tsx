import type { Metadata } from "next";
import { CheckCircle2, Clock3, HandHeart, XCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import {
  ProposalsManager,
  type SponsorProposalRow,
} from "@/features/sponsor-proposals/components/proposals-manager";

export const metadata: Metadata = { title: "Entourage" };

export default async function SponsorProposalsPage() {
  const { wedding } = await getCurrentWedding();
  const proposals = await db.sponsorProposal.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: { name: "asc" },
  });

  const rows: SponsorProposalRow[] = proposals.map((proposal) => ({
    id: proposal.id,
    role: proposal.role,
    name: proposal.name,
    email: proposal.email,
    phone: proposal.phone,
    customMessage: proposal.customMessage,
    status: proposal.status,
    hasToken: Boolean(proposal.tokenHash),
    openedAt: proposal.openedAt?.toISOString() ?? null,
    respondedAt: proposal.respondedAt?.toISOString() ?? null,
    responseMessage: proposal.responseMessage,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entourage"
        description="Create a personal proposal for each member of the entourage and follow their response."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All proposals" value={rows.length} icon={HandHeart} />
        <StatCard
          label="Pending"
          value={rows.filter((row) => row.status === "PENDING").length}
          icon={Clock3}
          accent="warning"
        />
        <StatCard
          label="Accepted"
          value={rows.filter((row) => row.status === "ACCEPTED").length}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Declined"
          value={rows.filter((row) => row.status === "DECLINED").length}
          icon={XCircle}
          accent="destructive"
        />
      </div>

      <ProposalsManager proposals={rows} />
    </div>
  );
}
