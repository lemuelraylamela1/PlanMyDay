"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { taskSchema } from "@/features/tasks/schemas";

function clean(v?: string | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}
function toDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function saveTaskAction(id: string | null, input: unknown): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;
  const data = {
    title: d.title,
    description: clean(d.description),
    category: clean(d.category),
    priority: d.priority,
    deadline: toDate(d.deadline),
    assignedPerson: clean(d.assignedPerson),
  };

  if (id) {
    const res = await db.task.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data,
    });
    if (res.count === 0) return fail("Task not found.");
  } else {
    await db.task.create({ data: { ...data, weddingId: wedding.id } });
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entityType: "Task",
    entityId: id ?? undefined,
    summary: `${id ? "Updated" : "Added"} task ${d.title}`,
  });

  revalidatePath("/tasks");
  return ok(undefined, "Task saved.");
}

export async function toggleTaskAction(id: string, completed: boolean): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  await db.task.updateMany({
    where: { id, weddingId: wedding.id, deletedAt: null },
    data: { completed, completedAt: completed ? new Date() : null },
  });
  if (completed) {
    await logActivity({
      weddingId: wedding.id,
      userId: user.id,
      action: "UPDATE",
      entityType: "Task",
      entityId: id,
      summary: "Completed a task",
    });
  }
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return ok();
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.task.updateMany({
    where: { id, weddingId: wedding.id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/tasks");
  return ok(undefined, "Task deleted.");
}

/** Seeds the checklist from the global task templates. */
export async function applyTaskTemplatesAction(): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const templates = await db.taskTemplate.findMany();
  if (templates.length === 0) return fail("No templates available.");

  const weddingDate = wedding.date;
  await db.task.createMany({
    data: templates.map((t) => ({
      weddingId: wedding.id,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      deadline:
        weddingDate && t.monthsBefore
          ? new Date(new Date(weddingDate).setMonth(weddingDate.getMonth() - t.monthsBefore))
          : null,
    })),
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "Task",
    summary: `Added ${templates.length} checklist tasks from template`,
  });

  revalidatePath("/tasks");
  return ok(undefined, `Added ${templates.length} tasks to your checklist.`);
}
