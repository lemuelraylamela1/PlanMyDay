"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { supplierSchema, supplierCategorySchema } from "@/features/suppliers/schemas";

function clean(v?: string | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}
function toDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function paymentStatus(contract: number, down: number): "UNPAID" | "PARTIAL" | "PAID" {
  if (down <= 0) return "UNPAID";
  if (down >= contract) return "PAID";
  return "PARTIAL";
}

export async function saveSupplierAction(id: string | null, input: unknown): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;
  const data = {
    company: d.company,
    categoryId: d.categoryId || null,
    contactPerson: clean(d.contactPerson),
    phone: clean(d.phone),
    email: clean(d.email),
    website: clean(d.website),
    contractAmount: d.contractAmount,
    downPayment: d.downPayment,
    dueDate: toDate(d.dueDate),
    status: d.status,
    paymentStatus: paymentStatus(d.contractAmount, d.downPayment),
    notes: clean(d.notes),
  };

  if (id) {
    const res = await db.supplier.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data,
    });
    if (res.count === 0) return fail("Supplier not found.");
  } else {
    await db.supplier.create({ data: { ...data, weddingId: wedding.id } });
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entityType: "Supplier",
    entityId: id ?? undefined,
    summary: `${id ? "Updated" : "Added"} supplier ${d.company}`,
  });

  revalidatePath("/suppliers");
  return ok(undefined, "Supplier saved.");
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  await db.supplier.updateMany({
    where: { id, weddingId: wedding.id },
    data: { deletedAt: new Date() },
  });
  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "DELETE",
    entityType: "Supplier",
    entityId: id,
    summary: "Deleted a supplier",
  });
  revalidatePath("/suppliers");
  return ok(undefined, "Supplier deleted.");
}

export async function createSupplierCategoryAction(input: unknown): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  const parsed = supplierCategorySchema.safeParse(input);
  if (!parsed.success) return fail("Enter a category name.");
  const existing = await db.supplierCategory.findFirst({
    where: { weddingId: wedding.id, name: parsed.data.name, deletedAt: null },
  });
  if (existing) return fail("That category already exists.");
  await db.supplierCategory.create({
    data: { weddingId: wedding.id, name: parsed.data.name },
  });
  revalidatePath("/suppliers");
  return ok(undefined, "Category added.");
}
