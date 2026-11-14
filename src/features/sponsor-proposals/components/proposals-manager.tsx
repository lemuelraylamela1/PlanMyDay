"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  HandHeart,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import {
  SortableTableHead,
  compareDate,
  compareText,
  type SortOrder,
} from "@/components/shared/sortable-table-head";
import {
  TablePagination,
  useClientPagination,
} from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteSponsorProposalAction,
  generateProposalLinkAction,
} from "@/features/sponsor-proposals/actions";
import { EntourageImportDialog } from "@/features/sponsor-proposals/components/import-dialog";
import {
  ProposalFormDialog,
  type ProposalFormValue,
} from "@/features/sponsor-proposals/components/proposal-form-dialog";
import {
  entourageRoleLabels,
  entourageRoles,
  normalizeExternalUrl,
  type EntourageRole,
} from "@/features/sponsor-proposals/schemas";

export interface SponsorProposalRow {
  id: string;
  role: EntourageRole;
  name: string;
  email: string | null;
  phone: string | null;
  facebookLink: string | null;
  customMessage: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  hasToken: boolean;
  openedAt: string | null;
  respondedAt: string | null;
  responseMessage: string | null;
}

const statusVariant = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "destructive",
} as const;

type ResponseFilter = "all" | "responded" | "opened" | "link" | "unshared";
type EntourageSortField = "name" | "role" | "facebook" | "status" | "response";

const STATUS_RANK: Record<SponsorProposalRow["status"], number> = {
  PENDING: 0,
  ACCEPTED: 1,
  DECLINED: 2,
};

const RESPONSE_RANK: Record<Exclude<ResponseFilter, "all">, number> = {
  unshared: 0,
  link: 1,
  opened: 2,
  responded: 3,
};

function responseKind(proposal: SponsorProposalRow): Exclude<ResponseFilter, "all"> {
  if (proposal.respondedAt) return "responded";
  if (proposal.openedAt) return "opened";
  if (proposal.hasToken) return "link";
  return "unshared";
}

function compareProposals(
  a: SponsorProposalRow,
  b: SponsorProposalRow,
  field: EntourageSortField,
  order: SortOrder,
) {
  const direction = order === "asc" ? 1 : -1;
  switch (field) {
    case "name":
      return compareText(a.name, b.name, direction);
    case "role":
      return (
        compareText(entourageRoleLabels[a.role], entourageRoleLabels[b.role], direction) ||
        compareText(a.name, b.name, direction)
      );
    case "facebook":
      return compareText(a.facebookLink, b.facebookLink, direction);
    case "status":
      return (
        (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * direction ||
        compareText(a.name, b.name, direction)
      );
    case "response": {
      const kindDiff =
        (RESPONSE_RANK[responseKind(a)] - RESPONSE_RANK[responseKind(b)]) * direction;
      if (kindDiff !== 0) return kindDiff;
      return (
        compareDate(a.respondedAt ?? a.openedAt, b.respondedAt ?? b.openedAt, direction) ||
        compareText(a.name, b.name, direction)
      );
    }
  }
}

function formatResponseTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProposalsManager({
  proposals,
}: {
  proposals: SponsorProposalRow[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SponsorProposalRow | null>(null);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [link, setLink] = React.useState<{ name: string; url: string; qr: string } | null>(null);
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState<"all" | EntourageRole>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | SponsorProposalRow["status"]>("all");
  const [response, setResponse] = React.useState<ResponseFilter>("all");
  const [sortField, setSortField] = React.useState<EntourageSortField>("name");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");

  function addProposal() {
    setEditing(null);
    setFormOpen(true);
  }

  function editProposal(proposal: SponsorProposalRow) {
    setEditing(proposal);
    setFormOpen(true);
  }

  async function generateLink(proposal: SponsorProposalRow) {
    if (
      proposal.hasToken &&
      !window.confirm("Regenerating will immediately invalidate the previous proposal link. Continue?")
    ) {
      return;
    }

    setLoadingId(proposal.id);
    const result = await generateProposalLinkAction(proposal.id);
    setLoadingId(null);
    if (!result.success || !result.data) {
      toast.error(result.success ? "Could not generate the link." : result.error);
      return;
    }
    setLink({ name: proposal.name, ...result.data });
    setLinkOpen(true);
    router.refresh();
  }

  async function deleteProposal(proposal: SponsorProposalRow) {
    if (!window.confirm(`Delete the proposal for ${proposal.name}? Their link will stop working.`)) {
      return;
    }
    setLoadingId(proposal.id);
    const result = await deleteSponsorProposalAction(proposal.id);
    setLoadingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Proposal deleted.");
    router.refresh();
  }

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const filtered = proposals.filter((proposal) => {
    if (role !== "all" && proposal.role !== role) return false;
    if (statusFilter !== "all" && proposal.status !== statusFilter) return false;
    if (response !== "all" && responseKind(proposal) !== response) return false;
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return [
      proposal.name,
      proposal.email,
      proposal.phone,
      proposal.facebookLink,
      proposal.responseMessage,
    ].some((value) => value?.toLowerCase().includes(term));
  });

  const sorted = [...filtered].sort((a, b) =>
    compareProposals(a, b, sortField, sortOrder),
  );
  const paginationResetKey = `${query}|${role}|${statusFilter}|${response}|${sortField}|${sortOrder}`;
  const {
    page,
    pageSize,
    pagedItems: visible,
    setPage,
    setPageSize,
  } = useClientPagination(sorted, paginationResetKey);

  function toggleSort(field: EntourageSortField) {
    if (sortField === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortOrder("asc");
  }

  const initial: ProposalFormValue | undefined = editing
    ? {
        id: editing.id,
        role: editing.role,
        name: editing.name,
        email: editing.email ?? "",
        phone: editing.phone ?? "",
        facebookLink: editing.facebookLink ?? "",
        customMessage: editing.customMessage,
      }
    : undefined;

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {proposals.length > 0 && <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, or reply…"
              aria-label="Search entourage"
              className="pl-9"
            />
          </div>
          <Select value={role} onValueChange={(value) => setRole(value as "all" | EntourageRole)}>
            <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by role">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {entourageRoles.map((option) => (
                <SelectItem key={option} value={option}>{entourageRoleLabels[option]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "all" | SponsorProposalRow["status"])}
          >
            <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
            </SelectContent>
          </Select>
          <Select value={response} onValueChange={(value) => setResponse(value as ResponseFilter)}>
            <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by response">
              <SelectValue placeholder="Response" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All responses</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="link">Link created</SelectItem>
              <SelectItem value="unshared">Not shared</SelectItem>
            </SelectContent>
          </Select>
        </div>}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/sponsor-proposals/export">
              <Download className="h-4 w-4" /> Export
            </a>
          </Button>
          <Button onClick={addProposal}>
            <Plus className="h-4 w-4" /> Add entourage
          </Button>
        </div>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={HandHeart}
          title="No entourage proposals yet"
          description="Add each person or couple, import a CSV, then create personal proposal links."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" /> Import CSV
              </Button>
              <Button onClick={addProposal}>
                <Plus className="h-4 w-4" /> Add your first proposal
              </Button>
            </div>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  label="Name"
                  active={sortField === "name"}
                  order={sortOrder}
                  onSort={() => toggleSort("name")}
                />
                <SortableTableHead
                  label="Role"
                  active={sortField === "role"}
                  order={sortOrder}
                  onSort={() => toggleSort("role")}
                />
                <SortableTableHead
                  label="Facebook Link"
                  className="hidden md:table-cell"
                  active={sortField === "facebook"}
                  order={sortOrder}
                  onSort={() => toggleSort("facebook")}
                />
                <SortableTableHead
                  label="Status"
                  active={sortField === "status"}
                  order={sortOrder}
                  onSort={() => toggleSort("status")}
                />
                <SortableTableHead
                  label="Response"
                  active={sortField === "response"}
                  order={sortOrder}
                  onSort={() => toggleSort("response")}
                />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No entourage matches this search or filter.
                  </TableCell>
                </TableRow>
              ) : visible.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <div className="font-medium">{proposal.name}</div>
                    {proposal.email && (
                      <div className="hidden text-xs text-muted-foreground sm:block">{proposal.email}</div>
                    )}
                  </TableCell>
                  <TableCell>{entourageRoleLabels[proposal.role]}</TableCell>
                  <TableCell className="hidden max-w-[220px] md:table-cell">
                    {proposal.facebookLink ? (
                      <a
                        href={normalizeExternalUrl(proposal.facebookLink) ?? proposal.facebookLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                        title={proposal.facebookLink}
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Open profile</span>
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[proposal.status]}>
                      {proposal.status.charAt(0) + proposal.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    {proposal.respondedAt ? (
                      <div className="space-y-1">
                        <p>{formatResponseTime(proposal.respondedAt)}</p>
                        {proposal.responseMessage && (
                          <p className="line-clamp-2 text-[#5c3d43]">“{proposal.responseMessage}”</p>
                        )}
                      </div>
                    ) : proposal.openedAt ? (
                      "Opened"
                    ) : proposal.hasToken ? (
                      "Link created"
                    ) : (
                      "Not shared"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loadingId === proposal.id}
                        onClick={() => generateLink(proposal)}
                        title={proposal.hasToken ? "Regenerate proposal link" : "Generate proposal link"}
                      >
                        {loadingId === proposal.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Link2 className="h-4 w-4" />}
                        <span className="hidden xl:inline">{proposal.hasToken ? "Regenerate" : "Create link"}</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => editProposal(proposal)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteProposal(proposal)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {proposals.length > 0 ? (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={sorted.length}
          noun="member"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      ) : null}

      <ProposalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={initial}
        onSaved={() => router.refresh()}
      />

      <EntourageImportDialog open={importOpen} onOpenChange={setImportOpen} />

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proposal website for {link?.name}</DialogTitle>
          </DialogHeader>
          {link && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Image
                  src={link.qr}
                  alt={`Proposal QR code for ${link.name}`}
                  width={220}
                  height={220}
                  className="rounded-lg border"
                  unoptimized
                />
              </div>
              <div className="flex items-center gap-2">
                <Input readOnly value={link.url} aria-label="Proposal website URL" />
                <Button variant="outline" size="icon" onClick={copyLink} title="Copy link">
                  {copied
                    ? <Check className="h-4 w-4 text-emerald-500" />
                    : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" asChild title="Open proposal website">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href={link.qr} download={`proposal-${link.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`}>
                  <Download className="h-4 w-4" /> Download QR code
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                Save this secure link now. For privacy, only its hash is stored and it cannot be
                shown again. Regenerating it will invalidate this version.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
