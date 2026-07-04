import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { SuppliersManager, type SupplierRow } from "@/features/suppliers/components/suppliers-manager";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const { wedding } = await getCurrentWedding();
  const [suppliers, categories] = await Promise.all([
    db.supplier.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    db.supplierCategory.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: SupplierRow[] = suppliers.map((s) => ({
    id: s.id,
    company: s.company,
    categoryId: s.categoryId,
    categoryName: s.category?.name ?? null,
    contactPerson: s.contactPerson,
    phone: s.phone,
    email: s.email,
    website: s.website,
    contractAmount: Number(s.contractAmount),
    downPayment: Number(s.downPayment),
    dueDate: s.dueDate ? s.dueDate.toISOString() : null,
    status: s.status,
    paymentStatus: s.paymentStatus,
    notes: s.notes,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" description="Manage vendors, contracts and payments" />
      <SuppliersManager suppliers={rows} categories={categories} currency={wedding.currency} />
    </div>
  );
}
