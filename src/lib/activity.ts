import type { ActivityAction, Prisma } from "@prisma/client";

import { db } from "@/lib/db";

interface LogActivityInput {
  weddingId: string;
  userId?: string | null;
  action: ActivityAction;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
}

/** Records an audit-trail entry. Failures are swallowed to never block a mutation. */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        weddingId: input.weddingId,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata,
      },
    });
  } catch (err) {
    console.error("Failed to write activity log", err);
  }
}
