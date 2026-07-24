import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getGuestMediaStorage } from "@/lib/guest-media-storage";
import { validateGuestMediaFile } from "@/lib/guest-media-storage/validation";
import { hashToken } from "@/lib/tokens";
import { guestUploadApiSchema } from "@/features/guest-uploads/schemas";
import { resolveUploadTokenForApi } from "@/features/guest-uploads/service";
import { createNotification } from "@/features/notifications/service";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");
  const guestName = String(formData.get("guestName") ?? "");
  const message = formData.get("message");
  const file = formData.get("file");

  const parsed = guestUploadApiSchema.safeParse({
    token,
    guestName,
    message: message ? String(message) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your name and try again." },
      { status: 400 },
    );
  }

  const tokenRecord = await resolveUploadTokenForApi(parsed.data.token);
  if (!tokenRecord) {
    return NextResponse.json({ error: "Upload is no longer available." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(
    `guest-upload:${ip}:${hashToken(parsed.data.token)}`,
    20,
    60_000,
  );
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads. Please try again shortly." }, { status: 429 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const validation = validateGuestMediaFile(file.name, file.type, file.size);
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await getGuestMediaStorage().upload(buffer, {
      weddingId: tokenRecord.wedding.id,
      weddingTitle: tokenRecord.wedding.title,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      mediaType: validation.mediaType,
    });

    const upload = await db.guestMediaUpload.create({
      data: {
        weddingId: tokenRecord.wedding.id,
        guestName: parsed.data.guestName,
        message: parsed.data.message ?? null,
        fileId: stored.fileId,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        fileSize: stored.fileSize,
        mediaType: validation.mediaType,
      },
    });

    await createNotification({
      weddingId: tokenRecord.wedding.id,
      type: "SYSTEM",
      title: "New guest upload",
      body: `${parsed.data.guestName} shared a ${validation.mediaType === "IMAGE" ? "photo" : "video"}.`,
      link: "/guest-uploads",
    });

    return NextResponse.json({ success: true, id: upload.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
    const friendly = message.includes("DECODER routines") || message.includes("OAuth")
      ? "Google Drive credentials are invalid. Run npm run drive:auth and set GOOGLE_DRIVE_REFRESH_TOKEN."
      : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
