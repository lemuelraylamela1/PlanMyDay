import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { GuestFilter } from "@/features/guests/schemas";

export async function listGuests(weddingId: string, filter: GuestFilter) {
  const where: Prisma.GuestWhereInput = {
    weddingId,
    deletedAt: null,
    ...(filter.side ? { side: filter.side } : {}),
    ...(filter.rsvpStatus ? { rsvpStatus: filter.rsvpStatus } : {}),
    ...(filter.q
      ? {
          OR: [
            { firstName: { contains: filter.q, mode: "insensitive" } },
            { lastName: { contains: filter.q, mode: "insensitive" } },
            { email: { contains: filter.q, mode: "insensitive" } },
            { preferredName: { contains: filter.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.guest.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
      include: { group: { select: { id: true, name: true } } },
    }),
    db.guest.count({ where }),
  ]);

  return {
    items,
    total,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filter.pageSize)),
  };
}

export async function getGuestStats(weddingId: string) {
  const [total, accepted, declined, pending, invited] = await Promise.all([
    db.guest.count({ where: { weddingId, deletedAt: null } }),
    db.guest.count({ where: { weddingId, deletedAt: null, rsvpStatus: "ACCEPTED" } }),
    db.guest.count({ where: { weddingId, deletedAt: null, rsvpStatus: "DECLINED" } }),
    db.guest.count({ where: { weddingId, deletedAt: null, rsvpStatus: "PENDING" } }),
    db.guest.count({ where: { weddingId, deletedAt: null, invitationStatus: { not: "NOT_SENT" } } }),
  ]);
  return { total, accepted, declined, pending, invited };
}

export async function listGuestGroups(weddingId: string) {
  return db.guestGroup.findMany({
    where: { weddingId, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function exportGuests(weddingId: string) {
  return db.guest.findMany({
    where: { weddingId, deletedAt: null },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}
