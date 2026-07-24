import "server-only";

import { db } from "@/lib/db";
import type { ActivityListFilter, ActivityListResult } from "@/features/activity/schemas";

export async function listActivityLogs(
  weddingId: string,
  filter: ActivityListFilter,
): Promise<ActivityListResult> {
  const where = { weddingId };

  const [rows, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.activityLog.count({ where }),
  ]);

  return {
    items: rows.map((log) => ({
      id: log.id,
      action: log.action,
      summary: log.summary,
      entityType: log.entityType,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    })),
    total,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filter.pageSize)),
  };
}
