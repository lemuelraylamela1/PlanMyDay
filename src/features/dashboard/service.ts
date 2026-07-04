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

export async function getDashboardStats(weddingId: string, weddingDate: Date | null): Promise<DashboardStats> {
  const [
    total,
    accepted,
    declined,
    pending,
    budgetItems,
    tasksTotal,
    tasksDone,
    suppliersTotal,
    suppliersBooked,
    wedding,
  ] = await Promise.all([
    db.guest.count({ where: { weddingId, deletedAt: null } }),
    db.guest.count({ where: { weddingId, deletedAt: null, rsvpStatus: "ACCEPTED" } }),
    db.guest.count({ where: { weddingId, deletedAt: null, rsvpStatus: "DECLINED" } }),
    db.guest.count({ where: { weddingId, deletedAt: null, rsvpStatus: "PENDING" } }),
    db.budgetItem.findMany({
      where: { weddingId, deletedAt: null },
      select: { estimatedCost: true, actualCost: true, paidAmount: true },
    }),
    db.task.count({ where: { weddingId, deletedAt: null } }),
    db.task.count({ where: { weddingId, deletedAt: null, completed: true } }),
    db.supplier.count({ where: { weddingId, deletedAt: null } }),
    db.supplier.count({ where: { weddingId, deletedAt: null, status: "BOOKED" } }),
    db.wedding.findUnique({ where: { id: weddingId }, select: { rsvpDeadline: true } }),
  ]);

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

export async function getRecentActivity(weddingId: string) {
  return db.activityLog.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
    take: 8,
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
