"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/features/notifications/actions";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();

  async function markAll() {
    const res = await markAllNotificationsReadAction();
    if (res.success) { toast.success(res.message ?? "Done."); router.refresh(); }
    else toast.error(res.error);
  }

  async function markOne(id: string) {
    await markNotificationReadAction(id);
    router.refresh();
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications"
        description="Deadlines, payments and RSVP updates will show up here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={markAll}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>
      {notifications.map((n) => (
        <Card key={n.id} className={n.readAt ? "opacity-70" : ""}>
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{n.title}</p>
              {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
            </div>
            {!n.readAt && (
              <Button variant="ghost" size="sm" onClick={() => markOne(n.id)}>
                Mark read
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
