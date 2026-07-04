import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { TimelineManager, type TimelineRow } from "@/features/timeline/components/timeline-manager";

export const metadata: Metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const { wedding } = await getCurrentWedding();
  const events = await db.timelineEvent.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: { startTime: "asc" },
  });

  const rows: TimelineRow[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime ? e.endTime.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Timeline" description="Plan your wedding-day schedule" />
      <TimelineManager events={rows} />
    </div>
  );
}
