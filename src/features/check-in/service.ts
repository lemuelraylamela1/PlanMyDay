import "server-only";

import QRCode from "qrcode";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateToken, hashToken } from "@/lib/tokens";
import { formatGuestDisplayName } from "@/features/guests/display-name";

export type GuestCheckInPayload = {
  qrDataUrl: string;
  fullName: string;
  guestCode: string;
};

export type CheckInResult =
  | {
      ok: true;
      fullName: string;
      alreadyCheckedIn: boolean;
      checkedInAt: string;
      plusOneName: string | null;
      rsvpStatus: "ACCEPTED";
    }
  | { ok: false; error: string; code: "INVALID" | "NOT_ACCEPTED" | "DISABLED" | "NOT_FOUND" };

export function checkInSessionUrl(token: string) {
  return `${env.appUrl}/check-in/${token}`;
}

/** Opaque payload encoded in the guest wedding-ID QR. */
export function encodeGuestCheckInQrPayload(guestCode: string) {
  return `pmd-checkin:${guestCode}`;
}

export function extractGuestCodeFromQrPayload(raw: string): string {
  const trimmed = raw.trim();
  const prefix = "pmd-checkin:";
  if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length).trim();
  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("code") ?? url.searchParams.get("guestCode");
    if (fromQuery) return fromQuery.trim();
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== "check-in") return last;
  } catch {
    // Not a URL — treat as raw token.
  }
  return trimmed;
}

export async function getCheckInQrDataUrl(payload: string) {
  return QRCode.toDataURL(payload, { margin: 1, width: 320 });
}

export async function issueCheckInSessionToken(weddingId: string, regenerate = false) {
  const existing = await db.checkInSessionToken.findUnique({ where: { weddingId } });
  if (existing && !regenerate) {
    return { token: existing.rawToken, url: checkInSessionUrl(existing.rawToken) };
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await db.checkInSessionToken.upsert({
    where: { weddingId },
    create: { weddingId, rawToken, tokenHash, isEnabled: true },
    update: { rawToken, tokenHash, isEnabled: true },
  });

  return { token: rawToken, url: checkInSessionUrl(rawToken) };
}

export async function regenerateCheckInSessionToken(weddingId: string) {
  return issueCheckInSessionToken(weddingId, true);
}

export async function setCheckInSessionEnabled(weddingId: string, enabled: boolean) {
  const existing = await db.checkInSessionToken.findUnique({ where: { weddingId } });
  if (!existing) {
    await issueCheckInSessionToken(weddingId);
  }
  await db.checkInSessionToken.update({
    where: { weddingId },
    data: { isEnabled: enabled },
  });
}

export async function resolveCheckInSessionToken(token: string) {
  if (!token) return null;

  const record = await db.checkInSessionToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      wedding: {
        select: {
          id: true,
          title: true,
          partner1Name: true,
          partner2Name: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!record || !record.isEnabled) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;
  if (record.wedding.deletedAt) return null;

  return record;
}

export async function getOwnerCheckInLink(weddingId: string) {
  const record = await db.checkInSessionToken.findUnique({ where: { weddingId } });
  if (!record) return null;
  const url = checkInSessionUrl(record.rawToken);
  const qr = await getCheckInQrDataUrl(url);
  return { url, qr, isEnabled: record.isEnabled };
}

function guestFullName(guest: {
  title: string | null;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
}) {
  // Prefer legal full name for door verification; still include title when set.
  const base = `${guest.firstName} ${guest.lastName}`.trim();
  const title = guest.title?.trim();
  return title ? `${title} ${base}` : base;
}

/**
 * Ensures an accepted guest has a check-in credential. Idempotent unless regenerate is true.
 */
export async function ensureGuestCheckInCredential(guestId: string, regenerate = false) {
  const guest = await db.guest.findFirst({
    where: { id: guestId, deletedAt: null },
  });
  if (!guest) return null;
  if (guest.rsvpStatus !== "ACCEPTED") return null;

  if (guest.checkInToken && guest.checkInTokenHash && !regenerate) {
    const guestCode = guest.checkInToken;
    const fullName = guestFullName(guest);
    const qrDataUrl = await getCheckInQrDataUrl(encodeGuestCheckInQrPayload(guestCode));
    return { guestCode, fullName, qrDataUrl, guest };
  }

  const guestCode = generateToken(24);
  const checkInTokenHash = hashToken(guestCode);

  const updated = await db.guest.update({
    where: { id: guestId },
    data: { checkInToken: guestCode, checkInTokenHash },
  });

  const fullName = guestFullName(updated);
  const qrDataUrl = await getCheckInQrDataUrl(encodeGuestCheckInQrPayload(guestCode));
  return { guestCode, fullName, qrDataUrl, guest: updated };
}

export async function getGuestCheckInPayload(guestId: string): Promise<GuestCheckInPayload | null> {
  const credential = await ensureGuestCheckInCredential(guestId, false);
  if (!credential) return null;
  return {
    qrDataUrl: credential.qrDataUrl,
    fullName: credential.fullName,
    guestCode: credential.guestCode,
  };
}

export async function regenerateGuestCheckInCredential(guestId: string) {
  return ensureGuestCheckInCredential(guestId, true);
}

export async function checkInGuestWithSession(sessionToken: string, rawGuestPayload: string): Promise<CheckInResult> {
  const session = await resolveCheckInSessionToken(sessionToken);
  if (!session) {
    return { ok: false, error: "Check-in is not available.", code: "DISABLED" };
  }

  const guestCode = extractGuestCodeFromQrPayload(rawGuestPayload);
  if (!guestCode) {
    return { ok: false, error: "Invalid QR code.", code: "INVALID" };
  }

  const guest = await db.guest.findFirst({
    where: {
      weddingId: session.weddingId,
      checkInTokenHash: hashToken(guestCode),
      deletedAt: null,
    },
  });

  if (!guest) {
    return { ok: false, error: "Guest not found for this wedding.", code: "NOT_FOUND" };
  }

  if (guest.rsvpStatus !== "ACCEPTED") {
    return { ok: false, error: "Guest has not accepted the invitation.", code: "NOT_ACCEPTED" };
  }

  const fullName = guestFullName(guest);
  const plusOneName =
    guest.plusOneAllowed && guest.plusOneName?.trim() ? guest.plusOneName.trim() : null;

  if (guest.checkedInAt) {
    return {
      ok: true,
      fullName,
      alreadyCheckedIn: true,
      checkedInAt: guest.checkedInAt.toISOString(),
      plusOneName,
      rsvpStatus: "ACCEPTED",
    };
  }

  const updated = await db.guest.update({
    where: { id: guest.id },
    data: { checkedInAt: new Date() },
  });

  return {
    ok: true,
    fullName,
    alreadyCheckedIn: false,
    checkedInAt: updated.checkedInAt!.toISOString(),
    plusOneName,
    rsvpStatus: "ACCEPTED",
  };
}

export async function undoGuestCheckIn(weddingId: string, guestId: string) {
  const guest = await db.guest.findFirst({
    where: { id: guestId, weddingId, deletedAt: null },
  });
  if (!guest) return null;

  return db.guest.update({
    where: { id: guestId },
    data: { checkedInAt: null },
  });
}

export async function listAcceptedGuestsForCheckIn(weddingId: string) {
  const guests = await db.guest.findMany({
    where: { weddingId, deletedAt: null, rsvpStatus: "ACCEPTED" },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      title: true,
      firstName: true,
      lastName: true,
      preferredName: true,
      plusOneAllowed: true,
      plusOneName: true,
      checkInToken: true,
      checkedInAt: true,
    },
  });

  return guests.map((g) => ({
    id: g.id,
    fullName: guestFullName(g),
    displayName: formatGuestDisplayName(g),
    plusOneName: g.plusOneAllowed ? g.plusOneName : null,
    hasCredential: Boolean(g.checkInToken),
    checkedInAt: g.checkedInAt?.toISOString() ?? null,
  }));
}

export async function getCheckInStats(weddingId: string) {
  const [accepted, arrived] = await Promise.all([
    db.guest.count({
      where: { weddingId, deletedAt: null, rsvpStatus: "ACCEPTED" },
    }),
    db.guest.count({
      where: {
        weddingId,
        deletedAt: null,
        rsvpStatus: "ACCEPTED",
        checkedInAt: { not: null },
      },
    }),
  ]);
  return { accepted, arrived };
}
