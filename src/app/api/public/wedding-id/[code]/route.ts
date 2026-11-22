import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { db } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import { encodeGuestCheckInQrPayload } from "@/features/check-in/service";

/**
 * Serves a guest's wedding-ID QR as a real PNG over HTTP.
 *
 * In-app browsers (Messenger, Facebook, Instagram) ignore `blob:` / `data:` downloads
 * and don't support Web Share with files. A plain HTTPS URL with
 * `Content-Disposition: attachment` is handed off to the OS download manager on
 * Android, and `?inline=1` gives iOS a real image to long-press → "Save to Photos".
 *
 * The guest code is itself the secret encoded in the QR, so knowing it reveals nothing new.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const guestCode = decodeURIComponent(code ?? "").trim();
  if (!guestCode) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const guest = await db.guest.findFirst({
    where: { checkInTokenHash: hashToken(guestCode), deletedAt: null, rsvpStatus: "ACCEPTED" },
    select: { firstName: true, lastName: true },
  });
  if (!guest) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const png = await QRCode.toBuffer(encodeGuestCheckInQrPayload(guestCode), {
    type: "png",
    margin: 2,
    width: 640,
  });

  const safeName =
    `${guest.firstName} ${guest.lastName}`
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-") || "guest";
  const filename = `wedding-id-${safeName}.png`;
  const inline = new URL(request.url).searchParams.get("inline") === "1";

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
