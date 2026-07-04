import "server-only";

import { db } from "@/lib/db";

export interface SearchResult {
  type: "Guest" | "Supplier" | "Task" | "Budget" | "Timeline" | "Table";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

/** Global search across the wedding's core entities. */
export async function searchWedding(weddingId: string, query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const contains = { contains: q, mode: "insensitive" as const };

  const [guests, suppliers, tasks, budgetItems, timeline, tables] = await Promise.all([
    db.guest.findMany({
      where: {
        weddingId,
        deletedAt: null,
        OR: [{ firstName: contains }, { lastName: contains }, { email: contains }],
      },
      take: 5,
      select: { id: true, firstName: true, lastName: true, rsvpStatus: true },
    }),
    db.supplier.findMany({
      where: { weddingId, deletedAt: null, OR: [{ company: contains }, { contactPerson: contains }] },
      take: 5,
      select: { id: true, company: true, contactPerson: true },
    }),
    db.task.findMany({
      where: { weddingId, deletedAt: null, title: contains },
      take: 5,
      select: { id: true, title: true, completed: true },
    }),
    db.budgetItem.findMany({
      where: { weddingId, deletedAt: null, name: contains },
      take: 5,
      select: { id: true, name: true },
    }),
    db.timelineEvent.findMany({
      where: { weddingId, deletedAt: null, title: contains },
      take: 5,
      select: { id: true, title: true },
    }),
    db.seatingTable.findMany({
      where: { weddingId, deletedAt: null, name: contains },
      take: 5,
      select: { id: true, name: true },
    }),
  ]);

  const results: SearchResult[] = [];
  for (const g of guests)
    results.push({
      type: "Guest",
      id: g.id,
      title: `${g.firstName} ${g.lastName}`,
      subtitle: g.rsvpStatus,
      href: `/guests?q=${encodeURIComponent(g.firstName)}`,
    });
  for (const s of suppliers)
    results.push({ type: "Supplier", id: s.id, title: s.company, subtitle: s.contactPerson ?? undefined, href: "/suppliers" });
  for (const t of tasks)
    results.push({ type: "Task", id: t.id, title: t.title, subtitle: t.completed ? "Done" : "Open", href: "/tasks" });
  for (const b of budgetItems)
    results.push({ type: "Budget", id: b.id, title: b.name, href: "/budget" });
  for (const e of timeline)
    results.push({ type: "Timeline", id: e.id, title: e.title, href: "/timeline" });
  for (const tb of tables)
    results.push({ type: "Table", id: tb.id, title: tb.name, href: "/seating" });

  return results;
}
