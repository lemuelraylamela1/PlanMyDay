import type { Metadata } from "next";
import { CheckCircle2, MessageSquareText, XCircle } from "lucide-react";

import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { listGuestResponses } from "@/features/guest-responses/service";
import { GuestResponsesTable } from "@/features/guest-responses/components/guest-responses-table";

export const metadata: Metadata = { title: "Guest Responses" };

export default async function GuestResponsesPage() {
  const { wedding } = await getCurrentWedding();
  const rows = await listGuestResponses(wedding.id);

  const accepted = rows.filter((r) => r.status === "ACCEPTED").length;
  const declined = rows.filter((r) => r.status === "DECLINED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Responses"
        description="Review meal preferences, dietary needs, messages, and hashtags from guests who already RSVP’d"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Responses" value={rows.length} icon={MessageSquareText} />
        <StatCard label="Accepted" value={accepted} icon={CheckCircle2} accent="success" />
        <StatCard label="Declined" value={declined} icon={XCircle} accent="destructive" />
      </div>

      <GuestResponsesTable rows={rows} />
    </div>
  );
}
