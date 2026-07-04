import "server-only";

import type { NotificationType } from "@prisma/client";

import { db } from "@/lib/db";

export async function listNotifications(weddingId: string, userId: string) {
  return db.notification.findMany({
    where: { weddingId, OR: [{ userId }, { userId: null }] },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function countUnread(weddingId: string, userId: string) {
  return db.notification.count({
    where: { weddingId, readAt: null, OR: [{ userId }, { userId: null }] },
  });
}

export async function createNotification(input: {
  weddingId: string;
  userId?: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  return db.notification.create({
    data: {
      weddingId: input.weddingId,
      userId: input.userId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });
}
