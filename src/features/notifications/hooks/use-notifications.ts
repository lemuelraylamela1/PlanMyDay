"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsData {
  items: NotificationItem[];
  unread: number;
}

async function fetchNotifications(): Promise<NotificationsData> {
  const res = await fetch("/api/notifications");
  if (!res.ok) return { items: [], unread: 0 };
  return res.json();
}

export function useNotifications(weddingId: string) {
  return useQuery({
    queryKey: queryKeys.notifications(weddingId),
    queryFn: fetchNotifications,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
