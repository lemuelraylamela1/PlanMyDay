"use client";

import * as React from "react";
import { Film, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  classifyGuestMediaFile,
  MAX_GUEST_IMAGES,
  MAX_GUEST_VIDEOS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/guest-media-storage/validation";

export interface SelectedMediaFile {
  id: string;
  file: File;
  previewUrl: string | null;
  mediaType: "IMAGE" | "VIDEO";
}

interface Props {
  files: SelectedMediaFile[];
  onChange: (files: SelectedMediaFile[]) => void;
  disabled?: boolean;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function maybeCompressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= 2 * 1024 * 1024) return file;
  if (file.type === "image/heic" || file.type === "image/heif") return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const maxDim = 2048;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

function validateAndBuild(file: File): SelectedMediaFile | { error: string } {
  const mediaType = classifyGuestMediaFile(file.name, file.type);
  if (!mediaType) {
    return { error: `${file.name}: unsupported file type.` };
  }
  if (mediaType === "IMAGE" && file.size > MAX_IMAGE_BYTES) {
    return { error: `${file.name}: images must be 25MB or smaller.` };
  }
  if (mediaType === "VIDEO" && file.size > MAX_VIDEO_BYTES) {
    return { error: `${file.name}: videos must be 100MB or smaller.` };
  }
  const previewUrl = mediaType === "IMAGE" ? URL.createObjectURL(file) : null;
  return { id: makeId(), file, previewUrl, mediaType };
}

export function MediaDropzone({ files, onChange, disabled }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const imageCount = files.filter((f) => f.mediaType === "IMAGE").length;
  const videoCount = files.filter((f) => f.mediaType === "VIDEO").length;

  async function addFiles(incoming: FileList | File[]) {
    const next = [...files];
    let images = imageCount;
    let videos = videoCount;

    for (const raw of Array.from(incoming)) {
      const processed = raw.type.startsWith("image/") ? await maybeCompressImage(raw) : raw;
      const result = validateAndBuild(processed);
      if ("error" in result) {
        toast.error(result.error);
        continue;
      }
      if (result.mediaType === "IMAGE" && images >= MAX_GUEST_IMAGES) {
        toast.error(`You can upload up to ${MAX_GUEST_IMAGES} photos.`);
        continue;
      }
      if (result.mediaType === "VIDEO" && videos >= MAX_GUEST_VIDEOS) {
        toast.error(`You can upload up to ${MAX_GUEST_VIDEOS} videos.`);
        continue;
      }
      if (result.mediaType === "IMAGE") images += 1;
      if (result.mediaType === "VIDEO") videos += 1;
      next.push(result);
    }

    onChange(next);
  }

  function removeFile(id: string) {
    const removed = files.find((f) => f.id === id);
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  }

  React.useEffect(() => {
    return () => {
      for (const f of files) {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      }
    };
  }, [files]);

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/30",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="font-medium">Drag & drop photos and videos here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Up to {MAX_GUEST_IMAGES} photos (25MB each) and {MAX_GUEST_VIDEOS} videos (100MB each)
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={disabled}>
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm,.jpg,.jpeg,.png,.webp,.heic,.heif,.mp4,.mov,.webm"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-lg border bg-muted/20">
              <div className="relative flex aspect-square items-center justify-center bg-muted">
                {f.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.previewUrl} alt={f.file.name} className="h-full w-full object-cover" />
                ) : f.mediaType === "VIDEO" ? (
                  <Film className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.id);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-background/90 p-1 opacity-0 shadow transition-opacity group-hover:opacity-100"
                  aria-label="Remove file"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="truncate p-2 text-xs">{f.file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
