import { NextResponse } from "next/server";
import { Readable } from "stream";

import { db } from "@/lib/db";
import { requireWeddingOwner } from "@/lib/authz";
import { getGuestMediaStorage } from "@/lib/guest-media-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const upload = await db.guestMediaUpload.findFirst({
    where: { id, deletedAt: null },
  });
  if (!upload) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    await requireWeddingOwner(upload.weddingId);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { stream, mimeType } = await getGuestMediaStorage().getFileStream(upload.fileId);
    const webStream = Readable.toWeb(stream as Readable) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable." }, { status: 404 });
  }
}
