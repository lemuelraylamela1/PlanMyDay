import type { Metadata } from "next";

import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { listNotifications } from "@/features/notifications/service";
import { NotificationsList, type NotificationRow } from "@/features/notifications/components/notifications-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { wedding, user } = await getCurrentWedding();
  const items = await listNotifications(wedding.id, user.id);

  const rows: NotificationRow[] = items.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay on top of important updates" />
      <NotificationsList notifications={rows} />
    </div>
  );
}
