"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { budgetItemSchema, type BudgetItemInput } from "@/features/budget/schemas";
import {
  saveBudgetItemAction,
  deleteBudgetItemAction,
  createBudgetCategoryAction,
} from "@/features/budget/actions";

export interface BudgetItemRow {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  notes: string | null;
}

interface Props {
  items: BudgetItemRow[];
  categories: { id: string; name: string }[];
  currency: string;
}

export function BudgetManager({ items, categories, currency }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BudgetItemRow | null>(null);
  const [pending, setPending] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BudgetItemInput>({ resolver: zodResolver(budgetItemSchema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", categoryId: "", estimatedCost: 0, actualCost: 0, paidAmount: 0, notes: "" });
    setOpen(true);
  }
  function openEdit(i: BudgetItemRow) {
    setEditing(i);
    reset({
      name: i.name,
      categoryId: i.categoryId ?? "",
      estimatedCost: i.estimatedCost,
      actualCost: i.actualCost,
      paidAmount: i.paidAmount,
      notes: i.notes ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: BudgetItemInput) {
    setPending(true);
    const res = await saveBudgetItemAction(editing?.id ?? null, values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); setOpen(false); router.refresh(); }
    else toast.error(res.error);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await deleteBudgetItemAction(id);
    if (res.success) { toast.success("Deleted."); router.refresh(); }
    else toast.error(res.error);
  }

  async function onAddCategory() {
    if (!newCategory.trim()) return;
    const res = await createBudgetCategoryAction({ name: newCategory, estimatedCost: 0 });
    if (res.success) { toast.success("Category added."); setNewCategory(""); router.refresh(); }
    else toast.error(res.error);
  }

  const categoryId = watch("categoryId");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="New category…"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-44"
          />
          <Button variant="outline" onClick={onAddCategory}>Add category</Button>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add item</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budget items yet"
          description="Start planning your spending by adding budget items."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add item</Button>}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Estimated</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{i.categoryName ?? "—"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(i.estimatedCost, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(i.actualCost, currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(i.paidAmount, currency)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Math.max(0, i.actualCost - i.paidAmount), currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(i.id)}>
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : "Add budget item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId || "none"}
                onValueChange={(v) => setValue("categoryId", v === "none" ? "" : v)}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated</Label>
                <Input id="estimatedCost" type="number" step="0.01" {...register("estimatedCost")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualCost">Actual</Label>
                <Input id="actualCost" type="number" step="0.01" {...register("actualCost")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidAmount">Paid</Label>
                <Input id="paidAmount" type="number" step="0.01" {...register("paidAmount")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={2} {...register("notes")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
