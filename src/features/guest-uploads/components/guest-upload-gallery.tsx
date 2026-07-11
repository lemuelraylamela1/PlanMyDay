"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Eye, Film, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Camera } from "lucide-react";
import { deleteGuestUploadAction } from "@/features/guest-uploads/actions";

export interface GuestUploadRow {
  id: string;
  guestName: string;
  message: string | null;
  fileName: string;
  mediaType: "IMAGE" | "VIDEO";
  uploadedAt: string;
}

export function GuestUploadGallery({ uploads }: { uploads: GuestUploadRow[] }) {
  const router = useRouter();
  const [viewId, setViewId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = React.useState(false);

  const viewing = uploads.find((u) => u.id === viewId);

  async function onDelete(id: string) {
    if (!confirm("Delete this upload permanently?")) return;
    setDeletingId(id);
    const res = await deleteGuestUploadAction(id);
    setDeletingId(null);
    if (res.success) {
      toast.success("Deleted.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function onDownloadAll() {
    setDownloadingAll(true);
    try {
      const res = await fetch("/api/guest-uploads/download-all");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Download failed.");
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

  if (uploads.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="No guest uploads yet"
        description="When guests share photos and videos via your QR code, they will appear here."
      />
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onDownloadAll} disabled={downloadingAll}>
          {downloadingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download all
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Preview</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead className="hidden md:table-cell">Message</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                    {u.mediaType === "IMAGE" ? (
                      <Image
                        src={`/api/guest-uploads/${u.id}/view`}
                        alt={u.fileName}
                        fill
                        className="object-cover"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Film className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{u.guestName}</TableCell>
                <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                  {u.message ?? "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {format(new Date(u.uploadedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{u.mediaType}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewId(u.id)} aria-label="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/api/guest-uploads/${u.id}/download`} aria-label="Download">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(u.id)}
                      disabled={deletingId === u.id}
                      aria-label="Delete"
                    >
                      {deletingId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={`/api/guest-uploads/${viewing.id}/view`}
                    alt={viewing.fileName}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
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
    </>
  );
}
