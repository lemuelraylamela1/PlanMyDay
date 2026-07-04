"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { budgetCategorySchema, budgetItemSchema } from "@/features/budget/schemas";

function clean(v?: string | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function createBudgetCategoryAction(input: unknown): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  const parsed = budgetCategorySchema.safeParse(input);
  if (!parsed.success) return fail("Enter a valid category.");
  const existing = await db.budgetCategory.findFirst({
    where: { weddingId: wedding.id, name: parsed.data.name, deletedAt: null },
  });
  if (existing) return fail("That category already exists.");
  await db.budgetCategory.create({
    data: {
      weddingId: wedding.id,
      name: parsed.data.name,
      estimatedCost: parsed.data.estimatedCost,
    },
  });
  revalidatePath("/budget");
  return ok(undefined, "Category added.");
}

export async function deleteBudgetCategoryAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.budgetCategory.updateMany({
    where: { id, weddingId: wedding.id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/budget");
  return ok(undefined, "Category deleted.");
}

export async function saveBudgetItemAction(id: string | null, input: unknown): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = budgetItemSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;
  const data = {
    name: d.name,
    categoryId: d.categoryId || null,
    estimatedCost: d.estimatedCost,
    actualCost: d.actualCost,
    paidAmount: d.paidAmount,
    notes: clean(d.notes),
  };

  if (id) {
    const res = await db.budgetItem.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data,
    });
    if (res.count === 0) return fail("Item not found.");
  } else {
    await db.budgetItem.create({ data: { ...data, weddingId: wedding.id } });
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entityType: "BudgetItem",
    entityId: id ?? undefined,
    summary: `${id ? "Updated" : "Added"} budget item ${d.name}`,
  });

  revalidatePath("/budget");
  return ok(undefined, "Budget item saved.");
}

export async function deleteBudgetItemAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.budgetItem.updateMany({
    where: { id, weddingId: wedding.id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/budget");
  return ok(undefined, "Item deleted.");
}
