"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import {
  supplierSchema,
  supplierCategorySchema,
  supplierPaymentSchema,
} from "@/features/suppliers/schemas";

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

async function syncSupplierPaymentTotals(tx: Prisma.TransactionClient, supplierId: string) {
  const [supplier, aggregate] = await Promise.all([
    tx.supplier.findUniqueOrThrow({
      where: { id: supplierId },
      select: { contractAmount: true },
    }),
    tx.supplierPayment.aggregate({
      where: { supplierId },
      _sum: { amount: true },
    }),
  ]);
  const paid = Number(aggregate._sum.amount ?? 0);
  await tx.supplier.update({
    where: { id: supplierId },
    data: {
      downPayment: paid,
      paymentStatus: paymentStatus(Number(supplier.contractAmount), paid),
    },
  });
}

/** Creates one history row for legacy paid totals. Safe to call whenever the page loads. */
export async function backfillSupplierOpeningPayments(): Promise<void> {
  const { wedding } = await getCurrentWedding();
  const suppliers = await db.supplier.findMany({
    where: {
      weddingId: wedding.id,
      deletedAt: null,
      downPayment: { gt: 0 },
      payments: { none: {} },
    },
    select: { id: true, downPayment: true, createdAt: true },
  });
  if (suppliers.length === 0) return;

  await db.supplierPayment.createMany({
    data: suppliers.map((supplier) => ({
      supplierId: supplier.id,
      amount: supplier.downPayment,
      paymentDate: supplier.createdAt,
      notes: "Opening payment imported from the previous paid amount.",
      openingPayment: true,
    })),
  });
}

export async function saveSupplierAction(id: string | null, input: unknown): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;
  const existing = id
    ? await db.supplier.findFirst({
        where: { id, weddingId: wedding.id, deletedAt: null },
        select: { downPayment: true },
      })
    : null;
  if (id && !existing) return fail("Supplier not found.");
  const paid = Number(existing?.downPayment ?? 0);
  if (paid > d.contractAmount) {
    return fail("Contract amount cannot be less than the supplier's recorded payments.");
  }
  const data = {
    company: d.company,
    categoryId: d.categoryId || null,
    contactPerson: clean(d.contactPerson),
    phone: clean(d.phone),
    email: clean(d.email),
    website: clean(d.website),
    contractAmount: d.contractAmount,
    dueDate: toDate(d.dueDate),
    status: d.status,
    paymentStatus: paymentStatus(d.contractAmount, paid),
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

export async function saveSupplierPaymentAction(
  supplierId: string,
  paymentId: string | null,
  input: unknown,
): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = supplierPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const supplier = await db.supplier.findFirst({
    where: { id: supplierId, weddingId: wedding.id, deletedAt: null },
    select: { id: true, company: true, contractAmount: true },
  });
  if (!supplier) return fail("Supplier not found.");

  if (paymentId) {
    const existingPayment = await db.supplierPayment.findFirst({
      where: { id: paymentId, supplierId },
      select: { id: true },
    });
    if (!existingPayment) return fail("Payment not found.");
  }

  const otherPayments = await db.supplierPayment.aggregate({
    where: { supplierId, ...(paymentId ? { id: { not: paymentId } } : {}) },
    _sum: { amount: true },
  });
  const newTotal = Number(otherPayments._sum.amount ?? 0) + parsed.data.amount;
  if (newTotal > Number(supplier.contractAmount)) {
    return fail("Payment exceeds the supplier's remaining balance.");
  }

  const paymentDate = new Date(`${parsed.data.paymentDate}T00:00:00`);
  const payment = await db.$transaction(async (tx) => {
    const saved = paymentId
      ? await tx.supplierPayment.update({
          where: { id: paymentId },
          data: {
            amount: parsed.data.amount,
            paymentDate,
            notes: clean(parsed.data.notes),
            openingPayment: false,
          },
        })
      : await tx.supplierPayment.create({
          data: {
            supplierId,
            amount: parsed.data.amount,
            paymentDate,
            notes: clean(parsed.data.notes),
          },
        });
    await syncSupplierPaymentTotals(tx, supplierId);
    return saved;
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: paymentId ? "UPDATE" : "CREATE",
    entityType: "SupplierPayment",
    entityId: payment.id,
    summary: `${paymentId ? "Updated" : "Recorded"} payment for ${supplier.company}`,
    metadata: { supplierId, amount: parsed.data.amount },
  });
  revalidatePath("/suppliers");
  return ok(undefined, paymentId ? "Payment updated." : "Payment recorded.");
}

export async function deleteSupplierPaymentAction(paymentId: string): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const payment = await db.supplierPayment.findFirst({
    where: {
      id: paymentId,
      supplier: { weddingId: wedding.id, deletedAt: null },
    },
    select: {
      id: true,
      supplierId: true,
      supplier: { select: { company: true } },
    },
  });
  if (!payment) return fail("Payment not found.");

  await db.$transaction(async (tx) => {
    await tx.supplierPayment.delete({ where: { id: paymentId } });
    await syncSupplierPaymentTotals(tx, payment.supplierId);
  });
  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "DELETE",
    entityType: "SupplierPayment",
    entityId: paymentId,
    summary: `Deleted payment for ${payment.supplier.company}`,
    metadata: { supplierId: payment.supplierId },
  });
  revalidatePath("/suppliers");
  return ok(undefined, "Payment deleted.");
}
