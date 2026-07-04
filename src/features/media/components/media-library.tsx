"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2, Trash2, FileText, Film, Music } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Image as ImageIcon } from "lucide-react";
import { deleteMediaAction } from "@/features/media/actions";

export interface MediaRow {
  id: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
  url: string;
  fileName: string;
  category: string | null;
}

const typeIcon = { VIDEO: Film, DOCUMENT: FileText, AUDIO: Music };

export function MediaLibrary({ assets }: { assets: MediaRow[] }) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Upload complete.");
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    const res = await deleteMediaAction(id);
    if (res.success) { toast.success("Deleted."); router.refresh(); }
    else toast.error(res.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={onUpload}
        />
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Your media library is empty"
          description="Upload photos, videos, music and documents for your wedding."
          action={
            <Button onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload files
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => {
            const Icon = a.type === "IMAGE" ? null : typeIcon[a.type];
            return (
              <Card key={a.id} className="group overflow-hidden">
                <div className="relative flex aspect-square items-center justify-center bg-muted">
                  {a.type === "IMAGE" ? (
                    <Image src={a.url} alt={a.fileName} fill className="object-cover" unoptimized />
                  ) : (
                    Icon && <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                  <button
                    onClick={() => onDelete(a.id)}
                    className="absolute right-2 top-2 rounded-md bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
                <CardContent className="p-2">
                  <p className="truncate text-xs">{a.fileName}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
