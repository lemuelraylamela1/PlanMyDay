import type { Metadata } from "next";
import { Wallet, TrendingUp, CreditCard, PiggyBank } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetChart } from "@/features/budget/components/budget-chart";
import { BudgetManager, type BudgetItemRow } from "@/features/budget/components/budget-manager";

export const metadata: Metadata = { title: "Budget" };

export default async function BudgetPage() {
  const { wedding } = await getCurrentWedding();
  const [items, categories] = await Promise.all([
    db.budgetItem.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    db.budgetCategory.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: BudgetItemRow[] = items.map((i) => ({
    id: i.id,
    name: i.name,
    categoryId: i.categoryId,
    categoryName: i.category?.name ?? null,
    estimatedCost: Number(i.estimatedCost),
    actualCost: Number(i.actualCost),
    paidAmount: Number(i.paidAmount),
    notes: i.notes,
  }));

  const estimated = rows.reduce((s, i) => s + i.estimatedCost, 0);
  const actual = rows.reduce((s, i) => s + i.actualCost, 0);
  const paid = rows.reduce((s, i) => s + i.paidAmount, 0);
  const remaining = Math.max(0, actual - paid);

  const byCategory = new Map<string, { estimated: number; actual: number }>();
  for (const i of rows) {
    const key = i.categoryName ?? "Uncategorized";
    const entry = byCategory.get(key) ?? { estimated: 0, actual: 0 };
    entry.estimated += i.estimatedCost;
    entry.actual += i.actualCost;
    byCategory.set(key, entry);
  }
  const chartData = Array.from(byCategory.entries()).map(([name, v]) => ({ name, ...v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Budget" description="Plan spending and track every payment" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Estimated" value={formatCurrency(estimated, wedding.currency)} icon={TrendingUp} />
        <StatCard label="Actual cost" value={formatCurrency(actual, wedding.currency)} icon={Wallet} accent="info" />
        <StatCard label="Paid" value={formatCurrency(paid, wedding.currency)} icon={CreditCard} accent="success" />
        <StatCard label="Balance due" value={formatCurrency(remaining, wedding.currency)} icon={PiggyBank} accent="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending by category</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetChart data={chartData} />
        </CardContent>
      </Card>

      <BudgetManager items={rows} categories={categories} currency={wedding.currency} />
    </div>
  );
}
