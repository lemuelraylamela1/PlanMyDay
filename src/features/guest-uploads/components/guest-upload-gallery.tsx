"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Camera,
  Download,
  Eye,
  Film,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteGuestUploadAction } from "@/features/guest-uploads/actions";
import type { GuestUploadSortField } from "@/features/guest-uploads/schemas";
import {
  useGuestUploads,
  useGuestUploadsLive,
  type GuestUploadRow,
  type GuestUploadsListData,
} from "@/features/guest-uploads/hooks/use-guest-uploads";

export type { GuestUploadRow };

interface Props {
  weddingId: string;
  onTotalChange?: (total: number) => void;
}

/** Keep decoded thumbnails across poll re-renders so images never flash. */
const thumbnailBlobCache = new Map<string, string>();

function SortIcon({ active, order }: { active: boolean; order: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
  return order === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" />
  );
}

const Thumbnail = React.memo(function Thumbnail({
  id,
  fileName,
  mediaType,
}: {
  id: string;
  fileName: string;
  mediaType: "IMAGE" | "VIDEO";
}) {
  const [src, setSrc] = React.useState<string | null>(() => thumbnailBlobCache.get(id) ?? null);

  React.useEffect(() => {
    if (mediaType !== "IMAGE") return;
    if (thumbnailBlobCache.has(id)) {
      setSrc(thumbnailBlobCache.get(id)!);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    void (async () => {
      try {
        const res = await fetch(`/api/guest-uploads/${id}/view`, { signal: controller.signal });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        thumbnailBlobCache.set(id, url);
        if (!cancelled) setSrc(url);
      } catch {
        // Ignore abort / network errors for thumbnails.
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, mediaType]);

  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
      {mediaType === "IMAGE" ? (
        src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={fileName} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="h-full w-full animate-pulse bg-muted-foreground/10" />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Film className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
});

const UploadRow = React.memo(function UploadRow({
  upload,
  deleting,
  onView,
  onDelete,
}: {
  upload: GuestUploadRow;
  deleting: boolean;
  onView: (id: string) => void;
  onDelete: (upload: GuestUploadRow) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <Thumbnail id={upload.id} fileName={upload.fileName} mediaType={upload.mediaType} />
      </TableCell>
      <TableCell className="font-medium">{upload.guestName}</TableCell>
      <TableCell className="hidden max-w-[200px] truncate md:table-cell">
        {upload.message ?? "—"}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {format(new Date(upload.uploadedAt), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{upload.mediaType}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onView(upload.id)} aria-label="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={`/api/guest-uploads/${upload.id}/download`} aria-label="Download">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(upload)}
            disabled={deleting}
            aria-label="Delete"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export function GuestUploadGallery({ weddingId, onTotalChange }: Props) {
  const queryClient = useQueryClient();
  const [viewId, setViewId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<GuestUploadRow | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = React.useState(false);

  const [query, setQuery] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [sort, setSort] = React.useState<GuestUploadSortField>("uploadedAt");
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");
  const [mediaType, setMediaType] = React.useState<"IMAGE" | "VIDEO" | "all">("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const params = React.useMemo(
    () => ({ q: debouncedQ, sort, order, mediaType, page, pageSize }),
    [debouncedQ, sort, order, mediaType, page],
  );

  const { data, isPending, isError, error, isPlaceholderData } = useGuestUploads(weddingId, params);
  useGuestUploadsLive(weddingId);

  const lastTotalRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (typeof data?.total !== "number") return;
    if (lastTotalRef.current === data.total) return;
    lastTotalRef.current = data.total;
    onTotalChange?.(data.total);
  }, [data?.total, onTotalChange]);

  const uploads = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const viewing = uploads.find((u) => u.id === viewId);
  const showInitialLoader = isPending && !data;

  const onView = React.useCallback((id: string) => setViewId(id), []);

  const requestDelete = React.useCallback((upload: GuestUploadRow) => {
    setDeleteTarget(upload);
  }, []);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);

    queryClient.setQueriesData<GuestUploadsListData>(
      { queryKey: ["guest-uploads", weddingId] },
      (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.filter((item) => item.id !== id),
          total: Math.max(0, current.total - 1),
        };
      },
    );

    const cached = thumbnailBlobCache.get(id);
    if (cached) {
      URL.revokeObjectURL(cached);
      thumbnailBlobCache.delete(id);
    }

    setDeleteTarget(null);

    const res = await deleteGuestUploadAction(id);
    setDeletingId(null);
    if (res.success) {
      toast.success("Deleted.");
    } else {
      toast.error(res.error);
    }
    await queryClient.invalidateQueries({ queryKey: ["guest-uploads", weddingId] });
  }

  function toggleSort(field: GuestUploadSortField) {
    if (sort === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder(field === "uploadedAt" ? "desc" : "asc");
    }
    setPage(1);
  }

  async function onDownloadAll() {
    setDownloadingAll(true);
    try {
      const res = await fetch("/api/guest-uploads/download-all");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Download failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "guest-uploads.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloadingAll(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guest, message, file…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={mediaType}
            onValueChange={(v) => {
              setMediaType(v as "IMAGE" | "VIDEO" | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="IMAGE">Images</SelectItem>
              <SelectItem value="VIDEO">Videos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onDownloadAll} disabled={downloadingAll || total === 0}>
            {downloadingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download all
          </Button>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load uploads."}
        </p>
      ) : showInitialLoader ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : uploads.length === 0 ? (
        <EmptyState
          icon={Camera}
          title={debouncedQ || mediaType !== "all" ? "No matching uploads" : "No guest uploads yet"}
          description={
            debouncedQ || mediaType !== "all"
              ? "Try a different search or filter."
              : "When guests share photos and videos via your QR code, they will appear here."
          }
        />
      ) : (
        <div
          className={`rounded-lg border transition-opacity duration-200 ${
            isPlaceholderData ? "opacity-70" : "opacity-100"
          }`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Preview</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium"
                    onClick={() => toggleSort("guestName")}
                  >
                    Guest
                    <SortIcon active={sort === "guestName"} order={order} />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead className="hidden sm:table-cell">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium"
                    onClick={() => toggleSort("uploadedAt")}
                  >
                    Date
                    <SortIcon active={sort === "uploadedAt"} order={order} />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium"
                    onClick={() => toggleSort("mediaType")}
                  >
                    Type
                    <SortIcon active={sort === "mediaType"} order={order} />
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads.map((u) => (
                <UploadRow
                  key={u.id}
                  upload={u}
                  deleting={deletingId === u.id}
                  onView={onView}
                  onDelete={requestDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} upload{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(viewId)} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewing?.guestName}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              {viewing.message && <p className="text-sm text-muted-foreground">{viewing.message}</p>}
              {viewing.mediaType === "IMAGE" ? (
                <PreviewImage id={viewing.id} fileName={viewing.fileName} />
              ) : (
                <video
                  src={`/api/guest-uploads/${viewing.id}/view`}
                  controls
                  className="w-full rounded-lg"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deletingId) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete upload?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently remove “${deleteTarget.fileName}” from ${deleteTarget.guestName}. This cannot be undone.`
                : "This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={Boolean(deletingId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={Boolean(deletingId)}
            >
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewImage({ id, fileName }: { id: string; fileName: string }) {
  const cached = thumbnailBlobCache.get(id);
  const [src, setSrc] = React.useState<string | null>(cached ?? null);

  React.useEffect(() => {
    if (cached) {
      setSrc(cached);
      return;
    }
    let cancelled = false;
    void fetch(`/api/guest-uploads/${id}/view`)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        thumbnailBlobCache.set(id, url);
        if (!cancelled) setSrc(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [id, cached]);

  if (!src) {
    return <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={fileName} className="max-h-[70vh] w-full rounded-lg object-contain" />
  );
}
