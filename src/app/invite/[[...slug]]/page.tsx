import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isWeddingInviteSlug } from "@/features/invitations/invite-path";
import { renderInviteByToken } from "@/features/invitations/invite-page";
import { env } from "@/lib/env";

const siteOrigin = (
  env.inviteAppUrl || "https://lemuelandgrazielle-wedding.vercel.app"
).replace(/\/+$/, "");

const inviteTitle = "You're Invited — Lemuel & Grazielle's Wedding";
const inviteDescription =
  "Join us as we celebrate our wedding day. Open your invitation to view the details and RSVP.";
const inviteImageUrl = `${siteOrigin}/og-invite-share.jpg`;

function buildInvitePath(slug?: string[]) {
  const parts = (slug ?? []).map((part) => encodeURIComponent(part));
  return parts.length > 0 ? `/invite/${parts.join("/")}` : "/invite";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const inviteUrl = `${siteOrigin}${buildInvitePath(slug)}`;

  return {
    metadataBase: new URL(siteOrigin),
    title: { absolute: inviteTitle },
    description: inviteDescription,
    alternates: { canonical: inviteUrl },
    openGraph: {
      type: "website",
      // Must match the shared invite URL — crawlers follow og:url as canonical.
      url: inviteUrl,
      title: inviteTitle,
      description: inviteDescription,
      siteName: "Lemuel & Grazielle",
      locale: "en_PH",
      images: [
        {
          url: inviteImageUrl,
          secureUrl: inviteImageUrl,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: "Lemuel and Grazielle — You're invited",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: inviteTitle,
      description: inviteDescription,
      images: [inviteImageUrl],
    },
  };
}

/**
 * Invite routes:
 * - /invite/{token}
 * - /invite/{guest-name}/{token}
 * - /invite/lemuelandgraziellewedding/{guest-name}/{token} (legacy)
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

  if (parts.length === 2) {
    return renderInviteByToken(decodeURIComponent(parts[1] ?? ""));
  }

  if (parts.length === 3 && isWeddingInviteSlug(parts[0] ?? "")) {
    return renderInviteByToken(decodeURIComponent(parts[2] ?? ""));
  }

  notFound();
}
