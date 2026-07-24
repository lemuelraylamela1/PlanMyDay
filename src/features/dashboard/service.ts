import "server-only";

import { db } from "@/lib/db";

export interface DashboardStats {
  guests: { total: number; accepted: number; declined: number; pending: number };
  budget: { estimated: number; actual: number; paid: number; remaining: number };
  tasks: { total: number; completed: number; percent: number };
  suppliers: { total: number; booked: number };
  countdownDays: number | null;
  rsvpDeadline: Date | null;
}

function countByKey<T extends string>(
  rows: { key: T; count: number }[],
  key: T,
): number {
  return rows.find((row) => row.key === key)?.count ?? 0;
}

export async function getDashboardStats(weddingId: string, weddingDate: Date | null): Promise<DashboardStats> {
  const [guestGroups, budgetItems, taskGroups, supplierGroups, wedding] = await Promise.all([
    db.guest.groupBy({
      by: ["rsvpStatus"],
      where: { weddingId, deletedAt: null },
      _count: { _all: true },
    }),
    db.budgetItem.findMany({
      where: { weddingId, deletedAt: null },
      select: { estimatedCost: true, actualCost: true, paidAmount: true },
    }),
    db.task.groupBy({
      by: ["completed"],
      where: { weddingId, deletedAt: null },
      _count: { _all: true },
    }),
    db.supplier.groupBy({
      by: ["status"],
      where: { weddingId, deletedAt: null },
      _count: { _all: true },
    }),
    db.wedding.findUnique({ where: { id: weddingId }, select: { rsvpDeadline: true } }),
  ]);

  const guestCounts = guestGroups.map((row) => ({
    key: row.rsvpStatus,
    count: row._count._all,
  }));
  const accepted = countByKey(guestCounts, "ACCEPTED");
  const declined = countByKey(guestCounts, "DECLINED");
  const pending = countByKey(guestCounts, "PENDING");
  const total = guestCounts.reduce((sum, row) => sum + row.count, 0);

  const tasksTotal = taskGroups.reduce((sum, row) => sum + row._count._all, 0);
  const tasksDone = taskGroups.find((row) => row.completed)?._count._all ?? 0;

  const supplierCounts = supplierGroups.map((row) => ({
    key: row.status,
    count: row._count._all,
  }));
  const suppliersTotal = supplierCounts.reduce((sum, row) => sum + row.count, 0);
  const suppliersBooked = countByKey(supplierCounts, "BOOKED");

  const estimated = budgetItems.reduce((sum, i) => sum + Number(i.estimatedCost), 0);
  const actual = budgetItems.reduce((sum, i) => sum + Number(i.actualCost), 0);
  const paid = budgetItems.reduce((sum, i) => sum + Number(i.paidAmount), 0);

  let countdownDays: number | null = null;
  if (weddingDate) {
    const diff = weddingDate.getTime() - Date.now();
    countdownDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    guests: { total, accepted, declined, pending },
    budget: { estimated, actual, paid, remaining: Math.max(0, actual - paid) },
    tasks: {
      total: tasksTotal,
      completed: tasksDone,
      percent: tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0,
    },
    suppliers: { total: suppliersTotal, booked: suppliersBooked },
    countdownDays,
    rsvpDeadline: wedding?.rsvpDeadline ?? null,
  };
}

export async function getRecentActivity(weddingId: string, take = 6) {
  return db.activityLog.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function getUpcomingTasks(weddingId: string) {
  return db.task.findMany({
    where: { weddingId, deletedAt: null, completed: false, deadline: { not: null } },
    orderBy: { deadline: "asc" },
    take: 5,
  });
}
