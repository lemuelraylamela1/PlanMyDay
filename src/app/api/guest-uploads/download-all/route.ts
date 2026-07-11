import { NextResponse } from "next/server";
import { Readable } from "stream";
import { ZipArchive } from "archiver";
import { PassThrough } from "stream";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { getGuestMediaStorage } from "@/lib/guest-media-storage";

export async function GET() {
  let wedding;
  try {
    ({ wedding } = await getCurrentWedding());
    await requireWeddingOwner(wedding.id);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uploads = await db.guestMediaUpload.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: { uploadedAt: "asc" },
  });

  if (uploads.length === 0) {
    return NextResponse.json({ error: "No uploads to download." }, { status: 404 });
  }

  const passThrough = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 5 } });
  archive.pipe(passThrough);

  const storage = getGuestMediaStorage();

  void (async () => {
    try {
      for (const upload of uploads) {
        const { stream, fileName } = await storage.getFileStream(upload.fileId);
        const safeName = `${upload.guestName.replace(/[^\w\s-]/g, "").trim() || "guest"}-${fileName}`;
        archive.append(stream as Readable, { name: safeName });
      }
      await archive.finalize();
    } catch {
      archive.abort();
      passThrough.destroy();
    }
  })();

  const webStream = Readable.toWeb(passThrough) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="guest-uploads.zip"',
    },
  });
}
