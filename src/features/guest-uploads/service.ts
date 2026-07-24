import "server-only";

import QRCode from "qrcode";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateToken, hashToken } from "@/lib/tokens";
import type { GuestUploadListFilter } from "@/features/guest-uploads/schemas";

export function uploadUrl(token: string) {
  return `${env.appUrl}/upload/${token}`;
}

/**
 * Ensures a wedding has a valid guest upload token. Returns the raw token and URL.
 * Reuses an existing token unless regenerate is true.
 */
export async function issueUploadToken(weddingId: string, regenerate = false) {
  const existing = await db.guestUploadToken.findUnique({ where: { weddingId } });
  if (existing && !regenerate) {
    return { token: existing.rawToken, url: uploadUrl(existing.rawToken) };
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await db.guestUploadToken.upsert({
    where: { weddingId },
    create: { weddingId, rawToken, tokenHash, isEnabled: true },
    update: { rawToken, tokenHash, isEnabled: true },
  });

  return { token: rawToken, url: uploadUrl(rawToken) };
}

export async function regenerateUploadToken(weddingId: string) {
  return issueUploadToken(weddingId, true);
}

export async function getUploadQrDataUrl(url: string) {
  return QRCode.toDataURL(url, { margin: 1, width: 320 });
}

/**
 * Resolves an upload token into wedding context for the public upload page.
 * Returns null for invalid/disabled/expired tokens.
 */
export async function resolveUploadToken(token: string) {
  if (!token) return null;

  const record = await db.guestUploadToken.findUnique({
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

export async function resolveUploadTokenForApi(token: string) {
  return resolveUploadToken(token);
}

export async function setUploadEnabled(weddingId: string, enabled: boolean) {
  await db.guestUploadToken.update({
    where: { weddingId },
    data: { isEnabled: enabled },
  });
}

export async function getOwnerUploadLink(weddingId: string) {
  const record = await db.guestUploadToken.findUnique({ where: { weddingId } });
  if (!record) return null;
  const url = uploadUrl(record.rawToken);
  const qr = await getUploadQrDataUrl(url);
  return { url, qr, isEnabled: record.isEnabled };
}

export async function getUploadTokenStatus(weddingId: string) {
  return db.guestUploadToken.findUnique({
    where: { weddingId },
    select: { isEnabled: true, expiresAt: true, createdAt: true },
  });
}

export async function listGuestUploads(weddingId: string, filter: GuestUploadListFilter) {
  const q = filter.q?.trim() ?? "";
  const where: Prisma.GuestMediaUploadWhereInput = {
    weddingId,
    deletedAt: null,
    ...(filter.mediaType && filter.mediaType !== "all" ? { mediaType: filter.mediaType } : {}),
    ...(q
      ? {
          OR: [
            { guestName: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
            { fileName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.GuestMediaUploadOrderByWithRelationInput = {
    [filter.sort]: filter.order,
  };

  const [items, total] = await Promise.all([
    db.guestMediaUpload.findMany({
      where,
      orderBy,
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
      select: {
        id: true,
        guestName: true,
        message: true,
        fileName: true,
        mediaType: true,
        uploadedAt: true,
      },
    }),
    db.guestMediaUpload.count({ where }),
  ]);

  return {
    items: items.map((u) => ({
      id: u.id,
      guestName: u.guestName,
      message: u.message,
      fileName: u.fileName,
      mediaType: (u.mediaType === "VIDEO" ? "VIDEO" : "IMAGE") as "IMAGE" | "VIDEO",
      uploadedAt: u.uploadedAt.toISOString(),
    })),
    total,
    page: filter.page,
    pageSize: filter.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filter.pageSize)),
  };
}
