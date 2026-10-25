"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  History,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  Search,
  Store,
  Trash2,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  supplierPaymentSchema,
  supplierSchema,
  type SupplierInput,
  type SupplierPaymentInput,
} from "@/features/suppliers/schemas";
import {
  saveSupplierAction,
  deleteSupplierAction,
  createSupplierCategoryAction,
  deleteSupplierPaymentAction,
  saveSupplierPaymentAction,
} from "@/features/suppliers/actions";
import {
  exportSuppliersToExcel,
  exportSuppliersToPdf,
} from "@/features/suppliers/supplier-export";

export interface SupplierPaymentRow {
  id: string;
  amount: number;
  paymentDate: string;
  notes: string | null;
  openingPayment: boolean;
}

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
  payments: SupplierPaymentRow[];
}

const statusVariant: Record<SupplierRow["status"], "success" | "info" | "warning" | "secondary" | "destructive"> = {
  BOOKED: "success",
  COMPLETED: "info",
  CONTACTED: "warning",
  PROSPECT: "secondary",
  CANCELLED: "destructive",
};

type SupplierSortField = "company" | "contact" | "status" | "contract" | "paid" | "balance" | "progress" | "due";
type SortOrder = "asc" | "desc";

const STATUS_RANK: Record<SupplierRow["status"], number> = {
  PROSPECT: 0,
  CONTACTED: 1,
  BOOKED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

const PAYMENT_RANK: Record<SupplierRow["paymentStatus"], number> = {
  UNPAID: 0,
  PARTIAL: 1,
  PAID: 2,
};

const NUMERIC_SORT_FIELDS = new Set<SupplierSortField>(["contract", "paid", "balance", "progress"]);

function supplierBalance(supplier: SupplierRow) {
  return Math.max(0, supplier.contractAmount - supplier.downPayment);
}

function supplierProgress(supplier: SupplierRow) {
  return supplier.contractAmount > 0 ? supplier.downPayment / supplier.contractAmount : 0;
}

function contactSortKey(supplier: SupplierRow) {
  return (supplier.phone || supplier.email || supplier.website || "").trim();
}

function compareSuppliers(a: SupplierRow, b: SupplierRow, field: SupplierSortField, order: SortOrder) {
  const direction = order === "asc" ? 1 : -1;
  switch (field) {
    case "company":
      return a.company.localeCompare(b.company, undefined, { sensitivity: "base" }) * direction;
    case "contact": {
      const left = contactSortKey(a);
      const right = contactSortKey(b);
      if (!left && !right) return 0;
      if (!left) return 1;
      if (!right) return -1;
      return left.localeCompare(right, undefined, { sensitivity: "base" }) * direction;
    }
    case "status":
      return (
        (STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
          PAYMENT_RANK[a.paymentStatus] - PAYMENT_RANK[b.paymentStatus]) * direction
      );
    case "contract":
      return (a.contractAmount - b.contractAmount) * direction;
    case "paid":
      return (a.downPayment - b.downPayment) * direction;
    case "balance":
      return (supplierBalance(a) - supplierBalance(b)) * direction;
    case "progress":
      return (supplierProgress(a) - supplierProgress(b)) * direction;
    case "due": {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * direction;
    }
  }
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
  return order === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
}

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
  const [search, setSearch] = React.useState("");
  const [paymentFilter, setPaymentFilter] = React.useState("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [historySupplierId, setHistorySupplierId] = React.useState<string | null>(null);
  const [editingPayment, setEditingPayment] = React.useState<SupplierPaymentRow | null>(null);
  const [paymentPending, setPaymentPending] = React.useState(false);
  const [exportPending, setExportPending] = React.useState<"PDF" | "EXCEL" | null>(null);
  const [sortField, setSortField] = React.useState<SupplierSortField | null>(null);
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierInput>({ resolver: zodResolver(supplierSchema) });
  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    formState: { errors: paymentErrors },
  } = useForm<SupplierPaymentInput>({ resolver: zodResolver(supplierPaymentSchema) });

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

  function paymentDateInput(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  }

  function startAddPayment() {
    setEditingPayment(null);
    resetPayment({ amount: 0, paymentDate: paymentDateInput(), notes: "" });
  }

  function openPaymentHistory(supplierId: string) {
    setHistorySupplierId(supplierId);
    startAddPayment();
  }

  function startEditPayment(payment: SupplierPaymentRow) {
    setEditingPayment(payment);
    resetPayment({
      amount: payment.amount,
      paymentDate: payment.paymentDate.slice(0, 10),
      notes: payment.notes ?? "",
    });
  }

  async function onPaymentSubmit(values: SupplierPaymentInput) {
    if (!historySupplierId) return;
    setPaymentPending(true);
    const res = await saveSupplierPaymentAction(historySupplierId, editingPayment?.id ?? null, values);
    setPaymentPending(false);
    if (res.success) {
      toast.success(res.message ?? "Payment saved.");
      startAddPayment();
      router.refresh();
    } else toast.error(res.error);
  }

  async function onDeletePayment(paymentId: string) {
    if (!confirm("Delete this payment? The supplier balance will be recalculated.")) return;
    setPaymentPending(true);
    const res = await deleteSupplierPaymentAction(paymentId);
    setPaymentPending(false);
    if (res.success) {
      toast.success(res.message ?? "Payment deleted.");
      if (editingPayment?.id === paymentId) startAddPayment();
      router.refresh();
    } else toast.error(res.error);
  }

  const status = watch("status");
  const categoryId = watch("categoryId");
  const activeSuppliers = suppliers.filter((supplier) => supplier.status !== "CANCELLED");
  const totals = activeSuppliers.reduce(
    (summary, supplier) => ({
      contracted: summary.contracted + supplier.contractAmount,
      paid: summary.paid + supplier.downPayment,
      balance: summary.balance + Math.max(0, supplier.contractAmount - supplier.downPayment),
    }),
    { contracted: 0, paid: 0, balance: 0 },
  );
  const filteredSuppliers = suppliers.filter((supplier) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      supplier.company.toLowerCase().includes(term) ||
      supplier.contactPerson?.toLowerCase().includes(term) ||
      supplier.categoryName?.toLowerCase().includes(term);
    return (
      matchesSearch &&
      (paymentFilter === "ALL" || supplier.paymentStatus === paymentFilter) &&
      (categoryFilter === "ALL" || supplier.categoryId === categoryFilter)
    );
  });
  const visibleSuppliers = sortField
    ? [...filteredSuppliers].sort((a, b) => compareSuppliers(a, b, sortField, sortOrder))
    : filteredSuppliers;

  function toggleSort(field: SupplierSortField) {
    if (sortField === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortOrder(NUMERIC_SORT_FIELDS.has(field) ? "desc" : "asc");
  }

  const historySupplier = suppliers.find((supplier) => supplier.id === historySupplierId) ?? null;
  const historyRemaining = historySupplier
    ? Math.max(0, historySupplier.contractAmount - historySupplier.downPayment)
    : 0;

  async function onExportPdf() {
    setExportPending("PDF");
    try {
      await exportSuppliersToPdf(visibleSuppliers, currency);
      toast.success("PDF report downloaded.");
    } catch {
      toast.error("Unable to create the PDF report.");
    } finally {
      setExportPending(null);
    }
  }

  function onExportExcel() {
    setExportPending("EXCEL");
    try {
      exportSuppliersToExcel(visibleSuppliers, currency);
      toast.success("Excel report downloaded.");
    } catch {
      toast.error("Unable to create the Excel report.");
    } finally {
      setExportPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total contracted</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{formatCurrency(totals.contracted, currency)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{activeSuppliers.length} active suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total paid</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{formatCurrency(totals.paid, currency)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totals.contracted > 0 ? Math.round((totals.paid / totals.contracted) * 100) : 0}% of commitments paid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining balance</CardTitle>
            <WalletCards className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{formatCurrency(totals.balance, currency)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across non-cancelled suppliers</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search suppliers, contacts, or categories"
              className="pl-9"
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All payments</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="PARTIAL">Partially paid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={filteredSuppliers.length === 0 || Boolean(exportPending)}>
                {exportPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {exportPending ? `Exporting ${exportPending}…` : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportPdf}>
                <FileText className="h-4 w-4" /> Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportExcel}>
                <FileSpreadsheet className="h-4 w-4" /> Export to Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add supplier</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="New category…"
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          className="w-48"
        />
        <Button variant="outline" onClick={onAddCategory}>Add category</Button>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No suppliers yet"
          description="Track your vendors, contracts and payments in one place."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add supplier</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {(
                  [
                    ["company", "Supplier", "left"],
                    ["contact", "Contact", "left"],
                    ["status", "Status", "left"],
                    ["contract", "Contract", "right"],
                    ["paid", "Paid", "right"],
                    ["balance", "Balance", "right"],
                    ["progress", "Progress", "left"],
                    ["due", "Due", "left"],
                  ] as const
                ).map(([field, label, align]) => (
                  <TableHead
                    key={field}
                    aria-sort={sortField === field ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    className={cn(
                      align === "right" && "text-right",
                      field === "contact" && "hidden md:table-cell",
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1 whitespace-nowrap font-medium hover:text-foreground",
                        sortField === field ? "text-foreground" : "text-muted-foreground",
                        align === "right" && "w-full justify-end",
                      )}
                      onClick={() => toggleSort(field)}
                    >
                      {label}
                      <SortIcon active={sortField === field} order={sortOrder} />
                    </button>
                  </TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center">
                    <p className="font-medium">No suppliers match your filters</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try a different search or filter.</p>
                  </TableCell>
                </TableRow>
              ) : visibleSuppliers.map((s) => {
                const balance = supplierBalance(s);
                const paidPercent = s.contractAmount > 0
                  ? Math.min(100, Math.round((s.downPayment / s.contractAmount) * 100))
                  : 0;
                const isOverdue =
                  Boolean(s.dueDate) && balance > 0 && new Date(s.dueDate!).getTime() < new Date().setHours(0, 0, 0, 0);
                const hasContact = Boolean(s.phone || s.email || s.website);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="min-w-40">
                      <p className="font-medium">{s.company}</p>
                      <p className="text-xs text-muted-foreground">{s.categoryName ?? "Uncategorized"}</p>
                      {s.contactPerson && (
                        <p className="text-xs text-muted-foreground">{s.contactPerson}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-52 md:table-cell">
                      {hasContact ? (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {s.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0" /> {s.phone}
                            </p>
                          )}
                          {s.email && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3 w-3 shrink-0" /> {s.email}
                            </p>
                          )}
                          {s.website && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Globe className="h-3 w-3 shrink-0" /> {s.website}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                        <Badge variant={s.paymentStatus === "PAID" ? "success" : s.paymentStatus === "PARTIAL" ? "warning" : "secondary"}>
                          {s.paymentStatus === "PARTIAL" ? "PARTIALLY PAID" : s.paymentStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatCurrency(s.contractAmount, currency)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatCurrency(s.downPayment, currency)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold">
                      {formatCurrency(balance, currency)}
                    </TableCell>
                    <TableCell className="min-w-28">
                      <div className="space-y-1">
                        <p className="text-right text-xs font-medium">{paidPercent}%</p>
                        <Progress value={paidPercent} />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {s.dueDate ? (
                        <p className={`flex items-center gap-1.5 text-xs ${isOverdue ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                          <CalendarDays className="h-3.5 w-3.5" />
                          {isOverdue ? "Overdue" : "Due"} {formatDate(s.dueDate)}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => openPaymentHistory(s.id)}>
                          <History className="h-4 w-4" />
                          {s.payments.length > 0
                            ? `View ${s.payments.length} payment${s.payments.length === 1 ? "" : "s"}`
                            : "Record payment"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${s.company}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPaymentHistory(s.id)}>
                              <History className="h-4 w-4" /> Payment history
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(s)}>
                              <Pencil className="h-4 w-4" /> Edit supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(s.id)}>
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
                <Label htmlFor="contractAmount">Total cost</Label>
                <Input id="contractAmount" type="number" min="0" step="0.01" {...register("contractAmount")} />
              </div>
              <div className="space-y-2">
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

      <Dialog
        open={Boolean(historySupplier)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setHistorySupplierId(null);
            setEditingPayment(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          {historySupplier && (
            <>
              <DialogHeader>
                <DialogTitle>Payments · {historySupplier.company}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Contract</p>
                      <p className="mt-1 font-medium">{formatCurrency(historySupplier.contractAmount, currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="mt-1 font-medium">{formatCurrency(historySupplier.downPayment, currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="mt-1 font-semibold">{formatCurrency(historyRemaining, currency)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Payment history</h3>
                        <p className="text-xs text-muted-foreground">Newest payments appear first.</p>
                      </div>
                      {editingPayment && (
                        <Button variant="outline" size="sm" onClick={startAddPayment}>Add new instead</Button>
                      )}
                    </div>
                    {historySupplier.payments.length === 0 ? (
                      <div className="rounded-lg border border-dashed py-10 text-center">
                        <ReceiptText className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">No payments recorded</p>
                        <p className="mt-1 text-xs text-muted-foreground">Use the form to record the first payment.</p>
                      </div>
                    ) : (
                      <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
                        {historySupplier.payments.map((payment) => (
                          <div key={payment.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">{formatCurrency(payment.amount, currency)}</p>
                                {payment.openingPayment && <Badge variant="secondary">Opening payment</Badge>}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                              {payment.notes && <p className="mt-2 break-words text-sm">{payment.notes}</p>}
                            </div>
                            <div className="flex shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Edit payment"
                                onClick={() => startEditPayment(payment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                aria-label="Delete payment"
                                disabled={paymentPending}
                                onClick={() => onDeletePayment(payment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit(onPaymentSubmit)} className="h-fit space-y-4 rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">{editingPayment ? "Edit payment" : "Record a payment"}</h3>
                    <p className="text-xs text-muted-foreground">
                      Available balance: {formatCurrency(historyRemaining + (editingPayment?.amount ?? 0), currency)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Amount</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      min="0.01"
                      max={historyRemaining + (editingPayment?.amount ?? 0)}
                      step="0.01"
                      {...registerPayment("amount")}
                    />
                    {paymentErrors.amount && (
                      <p className="text-xs text-destructive">{paymentErrors.amount.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment date</Label>
                    <Input id="paymentDate" type="date" {...registerPayment("paymentDate")} />
                    {paymentErrors.paymentDate && (
                      <p className="text-xs text-destructive">{paymentErrors.paymentDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">Notes</Label>
                    <Textarea
                      id="paymentNotes"
                      rows={3}
                      placeholder="Deposit, installment, receipt details…"
                      {...registerPayment("notes")}
                    />
                    {paymentErrors.notes && (
                      <p className="text-xs text-destructive">{paymentErrors.notes.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingPayment && (
                      <Button type="button" variant="outline" className="flex-1" onClick={startAddPayment}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={paymentPending || (!editingPayment && historyRemaining <= 0)}
                    >
                      {paymentPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editingPayment ? "Update payment" : "Record payment"}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
