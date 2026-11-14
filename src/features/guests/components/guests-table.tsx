"use client";

import * as React from "react";
import Image from "next/image";
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
  Circle,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Loader2,
  ExternalLink,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { SortableTableHead, type SortOrder } from "@/components/shared/sortable-table-head";
import { TablePagination, type PageSizeOption } from "@/components/shared/table-pagination";
import { Users } from "lucide-react";
import {
  GuestFormDialog,
  type GuestFormValue,
} from "@/features/guests/components/guest-form-dialog";
import { ImportDialog } from "@/features/guests/components/import-dialog";
import {
  deleteGuestsAction,
  bulkInviteAction,
  updateInvitationStatusAction,
} from "@/features/guests/actions";
import { formatGuestDisplayName } from "@/features/guests/display-name";
import { normalizeExternalUrl, type GuestSortField } from "@/features/guests/schemas";
import { generateInviteAction, regenerateInviteAction } from "@/features/invitations/actions";
import { getGuestCheckInQrAction } from "@/features/check-in/actions";
import { downloadQrPng } from "@/features/check-in/components/guest-check-in-qr-card";

export interface GuestRow {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string | null;
  phone: string | null;
  facebookLink: string | null;
  side: "BRIDE" | "GROOM" | "BOTH";
  relationship: string | null;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
  invitationStatus: "NOT_SENT" | "SENT";
  mealPreference: string | null;
  dietaryRestrictions: string | null;
  plusOneAllowed: boolean;
  plusOneName: string | null;
  notes: string | null;
  groupId: string | null;
  groupName: string | null;
}

const rsvpVariant: Record<GuestRow["rsvpStatus"], "success" | "destructive" | "warning" | "info"> =
  {
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
  pageSize: PageSizeOption;
  filter: {
    q?: string;
    side?: string;
    rsvpStatus?: string;
    sortBy?: GuestSortField;
    sortOrder?: SortOrder;
    pageSize?: PageSizeOption;
  };
}

export function GuestsTable({ guests, groups, page, total, pageSize, filter }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GuestFormValue | undefined>();
  const [query, setQuery] = React.useState(filter.q ?? "");
  const [pending, setPending] = React.useState(false);
  const [linkLoadingId, setLinkLoadingId] = React.useState<string | null>(null);
  const [rsvpLink, setRsvpLink] = React.useState<{
    name: string;
    url: string;
    qr: string;
    guestId: string;
  } | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [weddingIdQr, setWeddingIdQr] = React.useState<{
    fullName: string;
    qrDataUrl: string;
  } | null>(null);

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

  function toggleSort(field: GuestSortField) {
    if (filter.sortBy === field) {
      updateParams({
        sortBy: field,
        sortOrder: filter.sortOrder === "desc" ? "asc" : "desc",
      });
      return;
    }
    updateParams({ sortBy: field, sortOrder: "asc" });
  }

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(g: GuestRow) {
    setEditing({
      id: g.id,
      title: (g.title as GuestFormValue["title"]) ?? "",
      firstName: g.firstName,
      lastName: g.lastName,
      preferredName: g.preferredName ?? "",
      email: g.email ?? "",
      phone: g.phone ?? "",
      facebookLink: g.facebookLink ?? "",
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

  async function onGenerateRsvpLink(g: GuestRow) {
    setLinkLoadingId(g.id);
    const res = await generateInviteAction(g.id);
    setLinkLoadingId(null);
    if (res.success && res.data) {
      setRsvpLink({
        name: formatGuestDisplayName(g),
        url: res.data.url,
        qr: res.data.qr,
        guestId: g.id,
      });
      setCopied(false);
      setLinkDialogOpen(true);
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  async function onRegenerateRsvpLink() {
    if (!rsvpLink) return;
    if (
      !confirm("Generate a new invitation link? The previous link and QR code will stop working.")
    ) {
      return;
    }
    setLinkLoadingId(rsvpLink.guestId);
    const res = await regenerateInviteAction(rsvpLink.guestId);
    setLinkLoadingId(null);
    if (res.success && res.data) {
      setRsvpLink({ ...rsvpLink, url: res.data.url, qr: res.data.qr });
      setCopied(false);
      toast.success("New invitation link generated.");
    } else if (!res.success) {
      toast.error(res.error);
    }
  }

  async function copyRsvpLink() {
    if (!rsvpLink) return;
    await navigator.clipboard.writeText(rsvpLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function onOpenWeddingIdQr(g: GuestRow) {
    if (g.rsvpStatus !== "ACCEPTED") {
      toast.error("Wedding ID QR is only available after the guest accepts.");
      return;
    }
    setLinkLoadingId(g.id);
    const res = await getGuestCheckInQrAction(g.id);
    setLinkLoadingId(null);
    if (res.success && res.data) {
      setWeddingIdQr(res.data);
    } else if (!res.success) {
      toast.error(res.error);
    }
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
          <Select value={filter.side ?? "all"} onValueChange={(v) => updateParams({ side: v })}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Side" />
            </SelectTrigger>
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
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="RSVP" />
            </SelectTrigger>
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
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <SortableTableHead
                  label="Title"
                  className="w-[90px]"
                  active={filter.sortBy === "title"}
                  order={filter.sortOrder ?? "asc"}
                  onSort={() => toggleSort("title")}
                />
                <SortableTableHead
                  label="Name"
                  active={filter.sortBy === "name" || !filter.sortBy}
                  order={filter.sortOrder ?? "asc"}
                  onSort={() => toggleSort("name")}
                />
                <SortableTableHead
                  label="Facebook Link"
                  className="hidden md:table-cell"
                  active={filter.sortBy === "facebook"}
                  order={filter.sortOrder ?? "asc"}
                  onSort={() => toggleSort("facebook")}
                />
                <SortableTableHead
                  label="Side"
                  className="hidden lg:table-cell"
                  active={filter.sortBy === "side"}
                  order={filter.sortOrder ?? "asc"}
                  onSort={() => toggleSort("side")}
                />
                {/* <SortableTableHead
                  label="Group"
                  className="hidden lg:table-cell"
                  active={filter.sortBy === "group"}
                  order={filter.sortOrder ?? "asc"}
                  onSort={() => toggleSort("group")}
                /> */}
                <SortableTableHead
                  label="RSVP"
                  active={filter.sortBy === "rsvpStatus"}
                  order={filter.sortOrder ?? "asc"}
                  onSort={() => toggleSort("rsvpStatus")}
                />
                <SortableTableHead
                  label="Invite"
                  className="hidden sm:table-cell"
                  active={filter.sortBy === "invitationStatus"}
                  order={filter.sortOrder ?? "asc"}
                  onSort={() => toggleSort("invitationStatus")}
                />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((g) => (
                <TableRow key={g.id} data-state={selected.has(g.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(g.id)}
                      onCheckedChange={() => toggleOne(g.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{g.title || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {g.firstName} {g.lastName}
                    </div>
                    {g.preferredName && (
                      <div className="text-xs text-muted-foreground">
                        &ldquo;{g.preferredName}&rdquo;
                      </div>
                    )}
                    {g.email && (
                      <div className="text-xs text-muted-foreground md:hidden">{g.email}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden max-w-[220px] md:table-cell">
                    {g.facebookLink ? (
                      <a
                        href={normalizeExternalUrl(g.facebookLink) ?? g.facebookLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                        title={g.facebookLink}
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Open profile</span>
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden capitalize lg:table-cell">
                    {g.side.toLowerCase()}
                  </TableCell>
                  {/* <TableCell className="hidden lg:table-cell">{g.groupName ?? "—"}</TableCell> */}
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
                        <DropdownMenuItem
                          onClick={() => void onGenerateRsvpLink(g)}
                          disabled={linkLoadingId === g.id}
                        >
                          <QrCode className="h-4 w-4" /> Generate RSVP link
                        </DropdownMenuItem>
                        {g.rsvpStatus === "ACCEPTED" ? (
                          <DropdownMenuItem onClick={() => void onOpenWeddingIdQr(g)}>
                            <QrCode className="h-4 w-4" /> Wedding ID QR
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelected(new Set([g.id]));
                            onBulkInvite();
                          }}
                        >
                          <Mail className="h-4 w-4" /> Send invite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const res = await updateInvitationStatusAction(g.id, "NOT_SENT");
                            if (res.success) {
                              toast.success("Invitation marked as not sent.");
                              router.refresh();
                            } else toast.error(res.error);
                          }}
                        >
                          <Circle className="h-4 w-4" /> Mark as not sent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            const res = await updateInvitationStatusAction(g.id, "SENT");
                            if (res.success) {
                              toast.success("Invitation marked as sent.");
                              router.refresh();
                            } else toast.error(res.error);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Mark as sent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            if (!confirm("Delete this guest?")) return;
                            const res = await deleteGuestsAction([g.id]);
                            if (res.success) {
                              toast.success("Deleted.");
                              router.refresh();
                            } else toast.error(res.error);
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

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        noun="guest"
        onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
        onPageSizeChange={(nextSize) => updateParams({ pageSize: String(nextSize), page: "1" })}
      />

      <GuestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        groups={groups}
        initial={editing}
      />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSVP link for {rsvpLink?.name}</DialogTitle>
            <DialogDescription>
              This link stays valid until you generate a new one. It opens the RSVP website with{" "}
              {rsvpLink?.name}&apos;s name pre-filled — no personal details are exposed in the URL.
            </DialogDescription>
          </DialogHeader>
          {rsvpLink && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Image
                  src={rsvpLink.qr}
                  alt="RSVP QR code"
                  width={220}
                  height={220}
                  className="rounded-lg border"
                  unoptimized
                />
              </div>
              <div className="flex items-center gap-2">
                <Input readOnly value={rsvpLink.url} />
                <Button variant="outline" size="icon" onClick={copyRsvpLink}>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={onRegenerateRsvpLink}
                disabled={linkLoadingId === rsvpLink.guestId}
              >
                {linkLoadingId === rsvpLink.guestId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Generate new link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(weddingIdQr)} onOpenChange={(open) => !open && setWeddingIdQr(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wedding ID for {weddingIdQr?.fullName}</DialogTitle>
            <DialogDescription>
              Spare check-in QR for the entrance. Only accepted guests with this code can be
              verified.
            </DialogDescription>
          </DialogHeader>
          {weddingIdQr ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Image
                src={weddingIdQr.qrDataUrl}
                alt={`Wedding ID for ${weddingIdQr.fullName}`}
                width={240}
                height={240}
                className="rounded-lg border"
                unoptimized
              />
              <p className="font-medium">{weddingIdQr.fullName}</p>
              <Button onClick={() => downloadQrPng(weddingIdQr.qrDataUrl, weddingIdQr.fullName)}>
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
