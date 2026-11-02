import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isWeddingInviteSlug } from "@/features/invitations/invite-path";
import { renderInviteByToken } from "@/features/invitations/invite-page";

export const metadata: Metadata = {
  title: { absolute: "You're Invited in Lemuel and Grazielle Wedding" },
};

/**
 * Invite routes:
 * - /invite/{token}
 * - /invite/lemuelandgraziellewedding/{guest-name}/{token}
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const parts = (await params).slug ?? [];

  if (parts.length === 1) {
    return renderInviteByToken(decodeURIComponent(parts[0] ?? ""));
  }

  if (parts.length === 3 && isWeddingInviteSlug(parts[0] ?? "")) {
    return renderInviteByToken(decodeURIComponent(parts[2] ?? ""));
  }

  notFound();
}
