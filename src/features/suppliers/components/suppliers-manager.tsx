"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, MoreHorizontal, Globe, Phone, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Store } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { supplierSchema, type SupplierInput } from "@/features/suppliers/schemas";
import {
  saveSupplierAction,
  deleteSupplierAction,
  createSupplierCategoryAction,
} from "@/features/suppliers/actions";

export interface SupplierRow {
  id: string;
  company: string;
  categoryId: string | null;
  categoryName: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  contractAmount: number;
  downPayment: number;
  dueDate: string | null;
  status: SupplierInput["status"];
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  notes: string | null;
}

const statusVariant: Record<SupplierRow["status"], "success" | "info" | "warning" | "secondary" | "destructive"> = {
  BOOKED: "success",
  COMPLETED: "info",
  CONTACTED: "warning",
  PROSPECT: "secondary",
  CANCELLED: "destructive",
};

interface Props {
  suppliers: SupplierRow[];
  categories: { id: string; name: string }[];
  currency: string;
}

export function SuppliersManager({ suppliers, categories, currency }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SupplierRow | null>(null);
  const [pending, setPending] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierInput>({ resolver: zodResolver(supplierSchema) });

  function openCreate() {
    setEditing(null);
    reset({
      company: "",
      categoryId: "",
      contactPerson: "",
      phone: "",
      email: "",
      website: "",
      contractAmount: 0,
      downPayment: 0,
      dueDate: "",
      status: "PROSPECT",
      notes: "",
    });
    setOpen(true);
  }

  function openEdit(s: SupplierRow) {
    setEditing(s);
    reset({
      company: s.company,
      categoryId: s.categoryId ?? "",
      contactPerson: s.contactPerson ?? "",
      phone: s.phone ?? "",
      email: s.email ?? "",
      website: s.website ?? "",
      contractAmount: s.contractAmount,
      downPayment: s.downPayment,
      dueDate: s.dueDate ? s.dueDate.slice(0, 10) : "",
      status: s.status,
      notes: s.notes ?? "",
    });
    setOpen(true);
  }

  async function onSubmit(values: SupplierInput) {
    setPending(true);
    const res = await saveSupplierAction(editing?.id ?? null, values);
    setPending(false);
    if (res.success) {
      toast.success(res.message ?? "Saved.");
      setOpen(false);
      router.refresh();
    } else toast.error(res.error);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this supplier?")) return;
    const res = await deleteSupplierAction(id);
    if (res.success) { toast.success("Deleted."); router.refresh(); }
    else toast.error(res.error);
  }

  async function onAddCategory() {
    if (!newCategory.trim()) return;
    const res = await createSupplierCategoryAction({ name: newCategory });
    if (res.success) {
      toast.success("Category added.");
      setNewCategory("");
      router.refresh();
    } else toast.error(res.error);
  }

  const status = watch("status");
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
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add supplier
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No suppliers yet"
          description="Track your vendors, contracts and payments in one place."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add supplier</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{s.company}</h3>
                    {s.categoryName && (
                      <p className="text-xs text-muted-foreground">{s.categoryName}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(s.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  <Badge variant="secondary">{s.paymentStatus}</Badge>
                </div>
                {s.contactPerson && <p className="text-sm">{s.contactPerson}</p>}
                <div className="space-y-1 text-xs text-muted-foreground">
                  {s.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {s.phone}</p>}
                  {s.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {s.email}</p>}
                  {s.website && <p className="flex items-center gap-1"><Globe className="h-3 w-3" /> {s.website}</p>}
                </div>
                <div className="flex justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-medium">{formatCurrency(s.contractAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">
                    {formatCurrency(Math.max(0, s.contractAmount - s.downPayment), currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit supplier" : "Add supplier"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register("company")} />
                {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setValue("status", v as SupplierInput["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact person</Label>
                <Input id="contactPerson" {...register("contactPerson")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register("website")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractAmount">Contract amount</Label>
                <Input id="contractAmount" type="number" step="0.01" {...register("contractAmount")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment">Down payment</Label>
                <Input id="downPayment" type="number" step="0.01" {...register("downPayment")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="dueDate">Payment due date</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...register("notes")} />
              </div>
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
