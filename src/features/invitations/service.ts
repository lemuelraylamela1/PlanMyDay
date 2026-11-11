import "server-only";

import QRCode from "qrcode";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateToken, hashToken } from "@/lib/tokens";
import { formatGuestDisplayName } from "@/features/guests/display-name";
import { slugifyGuestName, WEDDING_INVITE_SLUG } from "@/features/invitations/invite-path";

export function invitationUrl(token: string, guestName?: string | null) {
  // Guest invites use the wedding public host (`/invite/...`).
  const base = (env.inviteAppUrl || env.appUrl || env.rsvpAppUrl).replace(/\/+$/, "");
  const encodedToken = encodeURIComponent(token);
  if (!base && env.isProd) {
    console.error("[PlanMyDay] Invite base URL is missing; invite links may be wrong.");
  }

  if (guestName?.trim()) {
    const guestSlug = slugifyGuestName(guestName);
    return `${base}/invite/${WEDDING_INVITE_SLUG}/${guestSlug}/${encodedToken}`;
  }

  return `${base}/invite/${encodedToken}`;
}

async function guestDisplayName(weddingId: string, guestId: string) {
  const guest = await db.guest.findFirst({
    where: { id: guestId, weddingId, deletedAt: null },
    select: {
      title: true,
      firstName: true,
      lastName: true,
      preferredName: true,
    },
  });
  return guest ? formatGuestDisplayName(guest) : null;
}

/**
 * Ensures a guest has a valid invitation token. Returns the raw token and URL.
 * Reuses the existing link unless `regenerate` is true — links do not expire by time.
 * Only regenerating (or first create) rotates the token and invalidates the previous URL.
 */
export async function issueInvitationToken(
  weddingId: string,
  guestId: string,
  regenerate = false,
) {
  const guestName = await guestDisplayName(weddingId, guestId);
  const existing = await db.invitationToken.findUnique({ where: { guestId } });

  if (existing && !regenerate && !existing.revokedAt && existing.rawToken) {
    // Clear any legacy expiry so older rows stay valid indefinitely.
    if (existing.expiresAt) {
      await db.invitationToken.update({
        where: { guestId },
        data: { expiresAt: null },
      });
    }
    return { token: existing.rawToken, url: invitationUrl(existing.rawToken, guestName) };
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await db.invitationToken.upsert({
    where: { guestId },
    create: {
      weddingId,
      guestId,
      rawToken,
      tokenHash,
      expiresAt: null,
    },
    update: {
      rawToken,
      tokenHash,
      expiresAt: null,
      revokedAt: null,
      openedAt: null,
    },
  });

  return { token: rawToken, url: invitationUrl(rawToken, guestName) };
}

export async function regenerateInvitationToken(weddingId: string, guestId: string) {
  return issueInvitationToken(weddingId, guestId, true);
}

export async function getInvitationQrDataUrl(url: string) {
  return QRCode.toDataURL(url, { margin: 1, width: 320 });
}

/**
 * Resolves an invitation token into guest + wedding context for the public
 * RSVP experience. Returns null for invalid/revoked tokens.
 * Invite links do not expire by time — only revoke or regenerate invalidates them.
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
  if (record.guest.deletedAt || record.wedding.deletedAt) return null;

  // Self-heal legacy rows that still have an expiresAt set.
  if (record.expiresAt) {
    await db.invitationToken.update({
      where: { id: record.id },
      data: { expiresAt: null },
    });
  }

  return record;
}

export async function markInvitationOpened(token: string) {
  const tokenHash = hashToken(token);
  await db.invitationToken.updateMany({
    where: { tokenHash, openedAt: null },
    data: { openedAt: new Date() },
  });
}
