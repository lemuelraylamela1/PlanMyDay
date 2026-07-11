export const GUEST_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
export const GUEST_VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm"]);

export const GUEST_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const GUEST_VIDEO_MIMES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

export const MAX_GUEST_IMAGES = 10;
export const MAX_GUEST_VIDEOS = 2;
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function classifyGuestMediaFile(fileName: string, mimeType: string): "IMAGE" | "VIDEO" | null {
  const ext = getFileExtension(fileName);
  if (GUEST_IMAGE_EXTENSIONS.has(ext) || GUEST_IMAGE_MIMES.has(mimeType)) return "IMAGE";
  if (GUEST_VIDEO_EXTENSIONS.has(ext) || GUEST_VIDEO_MIMES.has(mimeType)) return "VIDEO";
  return null;
}

export function validateGuestMediaFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
): { mediaType: "IMAGE" | "VIDEO" } | { error: string } {
  const mediaType = classifyGuestMediaFile(fileName, mimeType);
  if (!mediaType) {
    return { error: "Unsupported file type. Allowed: JPG, PNG, WebP, HEIC, MP4, MOV, WebM." };
  }
  if (mediaType === "IMAGE" && sizeBytes > MAX_IMAGE_BYTES) {
    return { error: "Each image must be 25MB or smaller." };
  }
  if (mediaType === "VIDEO" && sizeBytes > MAX_VIDEO_BYTES) {
    return { error: "Each video must be 100MB or smaller." };
  }
  return { mediaType };
}

export function sanitizeTextInput(value: string, maxLength: number): string {
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}
