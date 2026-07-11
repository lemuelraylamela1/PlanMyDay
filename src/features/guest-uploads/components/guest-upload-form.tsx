"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { guestUploadFormSchema, type GuestUploadFormInput } from "@/features/guest-uploads/schemas";
import { MediaDropzone, type SelectedMediaFile } from "@/features/guest-uploads/components/media-dropzone";
import { UploadProgress } from "@/features/guest-uploads/components/upload-progress";
import { UploadSuccess } from "@/features/guest-uploads/components/upload-success";

interface Props {
  token: string;
  coupleNames: string;
}

function uploadFileWithProgress(
  token: string,
  guestName: string,
  message: string | undefined,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("token", token);
    form.append("guestName", guestName);
    if (message) form.append("message", message);
    form.append("file", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      try {
        const data = JSON.parse(xhr.responseText) as { error?: string };
        reject(new Error(data.error ?? "Upload failed."));
      } catch {
        reject(new Error("Upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error. Please check your connection and try again."));
    xhr.open("POST", "/api/public/guest-upload");
    xhr.send(form);
  });
}

export function GuestUploadForm({ token, coupleNames }: Props) {
  const [files, setFiles] = React.useState<SelectedMediaFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [progress, setProgress] = React.useState<{ fileName: string; pct: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestUploadFormInput>({
    resolver: zodResolver(guestUploadFormSchema),
    defaultValues: { guestName: "", message: "" },
  });

  async function onSubmit(data: GuestUploadFormInput) {
    if (files.length === 0) {
      toast.error("Please add at least one photo or video.");
      return;
    }
    if (uploading || submitted) return;

    setUploading(true);
    try {
      for (const item of files) {
        setProgress({ fileName: item.file.name, pct: 0 });
        await uploadFileWithProgress(token, data.guestName, data.message, item.file, (pct) => {
          setProgress({ fileName: item.file.name, pct });
        });
      }
      setSubmitted(true);
      setProgress(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
      setProgress(null);
    } finally {
      setUploading(false);
    }
  }

  if (submitted) {
    return <UploadSuccess />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Share your favorite moments from <span className="font-medium text-foreground">{coupleNames}</span>
      </p>

      <div className="space-y-2">
        <Label htmlFor="guestName">Your name *</Label>
        <Input id="guestName" placeholder="How should we credit you?" {...register("guestName")} disabled={uploading} />
        {errors.guestName && <p className="text-xs text-destructive">{errors.guestName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message to the couple</Label>
        <Textarea
          id="message"
          placeholder="A short note (optional)"
          rows={3}
          {...register("message")}
          disabled={uploading}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <MediaDropzone files={files} onChange={setFiles} disabled={uploading} />

      {progress && <UploadProgress fileName={progress.fileName} progress={progress.pct} />}

      <Button type="submit" className="w-full" size="lg" disabled={uploading || files.length === 0}>
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            Share memories
          </>
        )}
      </Button>
    </form>
  );
}
