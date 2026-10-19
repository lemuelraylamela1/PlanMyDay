import "server-only";

import QRCode from "qrcode";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { generateToken, hashToken } from "@/lib/tokens";

export function proposalUrl(token: string) {
  return `${env.appUrl}/proposal/${encodeURIComponent(token)}`;
}

export async function issueProposalToken(weddingId: string, proposalId: string) {
  const token = generateToken();
  await db.sponsorProposal.update({
    where: { id: proposalId, weddingId },
    data: { tokenHash: hashToken(token), openedAt: null },
  });
  return { token, url: proposalUrl(token) };
}

export async function getProposalQrDataUrl(url: string) {
  return QRCode.toDataURL(url, { margin: 1, width: 320 });
}

export async function resolveSponsorProposal(token: string) {
  if (!token) return null;

  const proposal = await db.sponsorProposal.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      wedding: {
        select: {
          id: true,
          title: true,
          partner1Name: true,
          partner2Name: true,
          date: true,
          ceremonyTime: true,
          timezone: true,
          venueName: true,
          venueAddress: true,
          deletedAt: true,
          galleryItems: {
            where: {
              deletedAt: null,
              media: { deletedAt: null, type: "IMAGE" },
            },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              caption: true,
              media: { select: { url: true, fileName: true } },
            },
          },
        },
      },
    },
  });

  if (!proposal || proposal.deletedAt || proposal.wedding.deletedAt) return null;
  return proposal;
}

export async function markProposalOpened(token: string) {
  await db.sponsorProposal.updateMany({
    where: { tokenHash: hashToken(token), openedAt: null, deletedAt: null },
    data: { openedAt: new Date() },
  });
}
