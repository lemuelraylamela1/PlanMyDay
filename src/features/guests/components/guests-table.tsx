"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Upload,
  Download,
  Trash2,
  Mail,
  Pencil,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Users } from "lucide-react";
import { GuestFormDialog, type GuestFormValue } from "@/features/guests/components/guest-form-dialog";
import { ImportDialog } from "@/features/guests/components/import-dialog";
import { deleteGuestsAction, bulkInviteAction } from "@/features/guests/actions";

export interface GuestRow {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string | null;
  phone: string | null;
  side: "BRIDE" | "GROOM" | "BOTH";
  relationship: string | null;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
  invitationStatus: "NOT_SENT" | "SENT" | "OPENED" | "RESPONDED";
  mealPreference: string | null;
  dietaryRestrictions: string | null;
  plusOneAllowed: boolean;
  plusOneName: string | null;
  notes: string | null;
  groupId: string | null;
  groupName: string | null;
}

const rsvpVariant: Record<GuestRow["rsvpStatus"], "success" | "destructive" | "warning" | "info"> = {
  ACCEPTED: "success",
  DECLINED: "destructive",
  PENDING: "warning",
  TENTATIVE: "info",
};

interface Props {
  guests: GuestRow[];
  groups: { id: string; name: string }[];
  page: number;
  totalPages: number;
  total: number;
  filter: { q?: string; side?: string; rsvpStatus?: string };
}

export function GuestsTable({ guests, groups, page, totalPages, total, filter }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GuestFormValue | undefined>();
  const [query, setQuery] = React.useState(filter.q ?? "");
  const [pending, setPending] = React.useState(false);

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "" || value === "all") params.delete(key);
      else params.set(key, value);
    }
    if (!("page" in next)) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  React.useEffect(() => {
    const t = setTimeout(() => {
      if ((filter.q ?? "") !== query) updateParams({ q: query });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const allSelected = guests.length > 0 && guests.every((g) => selected.has(g.id));
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(guests.map((g) => g.id)));
  }
  function toggleOne(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(g: GuestRow) {
    setEditing({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      preferredName: g.preferredName ?? "",
      email: g.email ?? "",
      phone: g.phone ?? "",
      side: g.side,
      relationship: g.relationship ?? "",
      rsvpStatus: g.rsvpStatus,
      mealPreference: g.mealPreference ?? "",
      dietaryRestrictions: g.dietaryRestrictions ?? "",
      plusOneAllowed: g.plusOneAllowed,
      plusOneName: g.plusOneName ?? "",
      groupId: g.groupId ?? "",
      notes: g.notes ?? "",
    });
    setFormOpen(true);
  }

  async function onBulkDelete() {
    if (!confirm(`Delete ${selected.size} guest(s)? This cannot be undone.`)) return;
    setPending(true);
    const res = await deleteGuestsAction([...selected]);
    setPending(false);
    if (res.success) {
      toast.success(res.message ?? "Deleted.");
      setSelected(new Set());
      router.refresh();
    } else toast.error(res.error);
  }

  async function onBulkInvite() {
    setPending(true);
    const res = await bulkInviteAction([...selected]);
    setPending(false);
    if (res.success) {
      toast.success(res.message ?? "Invitations sent.");
      setSelected(new Set());
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.side ?? "all"}
            onValueChange={(v) => updateParams({ side: v })}
          >
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Side" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sides</SelectItem>
              <SelectItem value="BRIDE">Bride side</SelectItem>
              <SelectItem value="GROOM">Groom side</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filter.rsvpStatus ?? "all"}
            onValueChange={(v) => updateParams({ rsvpStatus: v })}
          >
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="RSVP" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RSVP</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
              <SelectItem value="TENTATIVE">Tentative</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/guests/export">
              <Download className="h-4 w-4" /> Export
            </a>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add guest
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-accent/40 px-4 py-2 text-sm">
          <span>{selected.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onBulkInvite} disabled={pending}>
              <Mail className="h-4 w-4" /> Invite
            </Button>
            <Button size="sm" variant="destructive" onClick={onBulkDelete} disabled={pending}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      {guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Add guests one by one, or import them from a CSV file."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add your first guest
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Side</TableHead>
                <TableHead className="hidden lg:table-cell">Group</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead className="hidden sm:table-cell">Invite</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((g) => (
                <TableRow key={g.id} data-state={selected.has(g.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={selected.has(g.id)} onCheckedChange={() => toggleOne(g.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {g.firstName} {g.lastName}
                    </div>
                    {g.preferredName && (
                      <div className="text-xs text-muted-foreground">&ldquo;{g.preferredName}&rdquo;</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{g.email ?? "—"}</div>
                    {g.phone && <div className="text-xs text-muted-foreground">{g.phone}</div>}
                  </TableCell>
                  <TableCell className="hidden capitalize lg:table-cell">
                    {g.side.toLowerCase()}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{g.groupName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={rsvpVariant[g.rsvpStatus]}>{g.rsvpStatus}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{g.invitationStatus.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(g)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelected(new Set([g.id])); onBulkInvite(); }}>
                          <Mail className="h-4 w-4" /> Send invite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (!confirm("Delete this guest?")) return;
                            const res = await deleteGuestsAction([g.id]);
                            if (res.success) { toast.success("Deleted."); router.refresh(); }
                            else toast.error(res.error);
                          }}
                        >
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} guest(s)</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      </div>

      <GuestFormDialog open={formOpen} onOpenChange={setFormOpen} groups={groups} initial={editing} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
