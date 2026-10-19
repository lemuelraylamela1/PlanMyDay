"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Images, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addGalleryItemAction,
  moveGalleryItemAction,
  removeGalleryItemAction,
  updateGalleryCaptionAction,
} from "@/features/website/actions";

export interface WebsiteGalleryItem {
  id: string;
  url: string;
  fileName: string;
  caption: string | null;
}

export function WebsiteGalleryManager({ items }: { items: WebsiteGalleryItem[] }) {
  const router = useRouter();
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    let added = 0;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("category", "website-gallery");
      const response = await fetch("/api/media/upload", { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.asset?.id) {
        toast.error(payload.error ?? `Failed to upload ${file.name}.`);
        continue;
      }
      const result = await addGalleryItemAction(payload.asset.id);
      if (!result.success) {
        toast.error(result.error);
        continue;
      }
      added += 1;
    }

    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
    if (added > 0) {
      toast.success(`${added} photo${added === 1 ? "" : "s"} added to the website gallery.`);
      router.refresh();
    }
  }

  async function saveCaption(id: string, caption: string) {
    const item = items.find((entry) => entry.id === id);
    if ((item?.caption ?? "") === caption.trim()) return;
    setBusyId(id);
    const result = await updateGalleryCaptionAction(id, caption);
    setBusyId(null);
    if (!result.success) toast.error(result.error);
    else router.refresh();
  }

  async function move(id: string, direction: "up" | "down") {
    setBusyId(id);
    const result = await moveGalleryItemAction(id, direction);
    setBusyId(null);
    if (!result.success) toast.error(result.error);
    else router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this photo from the wedding website gallery?")) return;
    setBusyId(id);
    const result = await removeGalleryItemAction(id);
    setBusyId(null);
    if (!result.success) toast.error(result.error);
    else {
      toast.success(result.message ?? "Photo removed.");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Pre-wedding photo gallery</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            These shared photos appear on your wedding website and every sponsor proposal.
          </p>
        </div>
        <Button disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Add photos"}
        </Button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={upload}
        />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No pre-wedding photos yet"
            description="Upload your favorite photos to bring the fairytale proposal website to life."
            action={
              <Button variant="outline" onClick={() => fileInput.current?.click()}>
                <Plus className="h-4 w-4" /> Add photos
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <div key={item.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.url}
                    alt={item.caption || item.fileName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {busyId === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-3">
                  <Input
                    defaultValue={item.caption ?? ""}
                    maxLength={500}
                    placeholder="Add a caption"
                    onBlur={(event) => saveCaption(item.id, event.currentTarget.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={index === 0 || busyId === item.id}
                        onClick={() => move(item.id, "up")}
                        title="Move photo earlier"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={index === items.length - 1 || busyId === item.id}
                        onClick={() => move(item.id, "down")}
                        title="Move photo later"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={busyId === item.id}
                      onClick={() => remove(item.id)}
                      title="Remove from gallery"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
