import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { generateToken } from "@/lib/tokens";

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_MIME: Record<string, "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "application/pdf": "DOCUMENT",
  "audio/mpeg": "AUDIO",
  "audio/mp3": "AUDIO",
  "audio/wav": "AUDIO",
};

export interface StoredFile {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
}

/**
 * Persists an uploaded file. Uses local disk in development; swap the body for
 * S3/R2/Supabase in production (keyed off STORAGE_DRIVER) without changing callers.
 */
export async function storeFile(weddingId: string, file: File): Promise<StoredFile> {
  const mediaType = ALLOWED_MIME[file.type];
  if (!mediaType) throw new Error("Unsupported file type.");
  if (file.size > MAX_FILE_BYTES) throw new Error("File exceeds the 10MB limit.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const safeName = `${generateToken(8)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", weddingId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), buffer);

  return {
    url: `/uploads/${weddingId}/${safeName}`,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    mediaType,
  };
}
