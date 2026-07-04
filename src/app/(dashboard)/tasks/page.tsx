import type { Metadata } from "next";
import { ListChecks, CheckCircle2, Clock } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TasksManager, type TaskRow } from "@/features/tasks/components/tasks-manager";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const { wedding } = await getCurrentWedding();
  const tasks = await db.task.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: [{ completed: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
  });

  const rows: TaskRow[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    priority: t.priority,
    deadline: t.deadline ? t.deadline.toISOString() : null,
    assignedPerson: t.assignedPerson,
    completed: t.completed,
  }));

  const completed = rows.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Your wedding planning checklist" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total tasks" value={rows.length} icon={ListChecks} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} accent="success" />
        <StatCard label="Remaining" value={rows.length - completed} icon={Clock} accent="warning" />
      </div>

      <TasksManager tasks={rows} />
    </div>
  );
}
