import type { Metadata } from "next";

import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { ACTIVITY_PAGE_SIZE } from "@/features/activity/schemas";
import { listActivityLogs } from "@/features/activity/service";
import { ActivityFeed } from "@/features/activity/components/activity-feed";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  const { wedding } = await getCurrentWedding();
  const initialData = await listActivityLogs(wedding.id, {
    page: 1,
    pageSize: ACTIVITY_PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" description="A log of important actions in your wedding" />
      <ActivityFeed weddingId={wedding.id} initialData={initialData} />
    </div>
  );
}
