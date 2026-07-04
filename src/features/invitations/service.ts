import "server-only";

import QRCode from "qrcode";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateToken, hashToken } from "@/lib/tokens";

export function invitationUrl(token: string) {
  return `${env.appUrl}/invite/${token}`;
}

/**
 * Ensures a guest has a valid invitation token. Returns the raw token and URL.
 * Only the hash is stored; the raw token is exposed once (for links/QR).
 */
export async function issueInvitationToken(weddingId: string, guestId: string) {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await db.invitationToken.upsert({
    where: { guestId },
    create: { weddingId, guestId, tokenHash },
    update: { tokenHash, revokedAt: null, openedAt: null },
  });

  return { token: rawToken, url: invitationUrl(rawToken) };
}

export async function getInvitationQrDataUrl(url: string) {
  return QRCode.toDataURL(url, { margin: 1, width: 320 });
}

/**
 * Resolves an invitation token into guest + wedding context for the public
 * RSVP experience. Returns null for invalid/revoked/expired tokens.
 * Never exposes tokens or other guests' data.
 */
export async function resolveInvitation(token: string) {
  if (!token) return null;
  const record = await db.invitationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      guest: {
        include: {
          seatAssignment: { include: { table: { select: { name: true } } } },
        },
      },
      wedding: {
        include: { settings: true },
      },
    },
  });

  if (!record || record.revokedAt) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;
  if (record.guest.deletedAt || record.wedding.deletedAt) return null;

  return record;
}

export async function markInvitationOpened(token: string) {
  const tokenHash = hashToken(token);
  await db.invitationToken.updateMany({
    where: { tokenHash, openedAt: null },
    data: { openedAt: new Date() },
  });
}
