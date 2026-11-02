import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { PageHeader } from "@/components/shared/page-header";
import {
  getCheckInStats,
  getOwnerCheckInLink,
  listAcceptedGuestsForCheckIn,
} from "@/features/check-in/service";
import { CheckInDashboardClient } from "@/features/check-in/components/check-in-dashboard-client";

export const metadata: Metadata = { title: "Guest Check-in" };

export default async function CheckInDashboardPage() {
  const { wedding } = await getCurrentWedding();

  try {
    await requireWeddingOwner(wedding.id);
  } catch {
    redirect("/dashboard");
  }

  const [link, stats, guests] = await Promise.all([
    getOwnerCheckInLink(wedding.id),
    getCheckInStats(wedding.id),
    listAcceptedGuestsForCheckIn(wedding.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Check-in"
        description="Share a scanner link with your coordinator and keep spare wedding ID QRs for accepted guests"
      />
      <CheckInDashboardClient
        initialEnabled={link?.isEnabled ?? true}
        initialUrl={link?.url ?? null}
        initialQr={link?.qr ?? null}
        stats={stats}
        guests={guests}
      />
    </div>
  );
}
