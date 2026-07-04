import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { storeFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  let wedding, user;
  try {
    ({ wedding, user } = await getCurrentWedding());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`upload:${user.id}`, 30, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = (formData.get("category") as string) || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const stored = await storeFile(wedding.id, file);
    const asset = await db.mediaAsset.create({
      data: {
        weddingId: wedding.id,
        type: stored.mediaType,
        url: stored.url,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        category,
      },
    });
    await logActivity({
      weddingId: wedding.id,
      userId: user.id,
      action: "CREATE",
      entityType: "MediaAsset",
      entityId: asset.id,
      summary: `Uploaded ${stored.fileName}`,
    });
    return NextResponse.json({ asset });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 400 },
    );
  }
}
