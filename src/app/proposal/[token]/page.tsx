import type { Metadata } from "next";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposalExperience } from "@/features/sponsor-proposals/components/fairytale-photo-gallery";
import { ProposalResponseForm } from "@/features/sponsor-proposals/components/proposal-response-form";
import {
  markProposalOpened,
  resolveSponsorProposal,
} from "@/features/sponsor-proposals/service";
import { entouragePlace } from "@/features/sponsor-proposals/schemas";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "A Special Wedding Proposal",
  description: "You have been invited to hold a special place in our wedding.",
};

function formatCeremonyTime(date: Date, timeZone: string) {
  const zone = timeZone === "GMT" ? "UTC" : timeZone;
  try {
    return new Intl.DateTimeFormat("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: zone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
}

export default async function SponsorProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const proposal = await resolveSponsorProposal(token);

  if (!proposal) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFDF8] p-4">
        <Card className="w-full max-w-md border-[#E8B8C7] text-center shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-[#B76E79]">Proposal not found</CardTitle>
            <CardDescription>
              This private proposal link is invalid or no longer available. Please ask the couple
              for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  await markProposalOpened(token);

  const { wedding } = proposal;
  const coupleNames =
    [wedding.partner1Name, wedding.partner2Name].filter(Boolean).join(" & ") || wedding.title;

  return (
    <ProposalExperience
      images={wedding.galleryItems.map((item) => ({
        id: item.id,
        url: item.media.url,
        fileName: item.media.fileName,
        caption: item.caption,
      }))}
      coupleNames={coupleNames}
      honoreeName={proposal.name}
      rolePhrase={entouragePlace(proposal.role, wedding.partner1Name, wedding.partner2Name)}
      message={proposal.customMessage}
      dateLabel={wedding.date ? formatDate(wedding.date) : null}
      timeLabel={
        wedding.ceremonyTime
          ? formatCeremonyTime(wedding.ceremonyTime, wedding.timezone)
          : null
      }
      venueName={wedding.venueName}
      venueAddress={wedding.venueAddress}
    >
      <ProposalResponseForm
        token={token}
        rolePhrase={entouragePlace(proposal.role, wedding.partner1Name, wedding.partner2Name)}
        initialStatus={proposal.status}
        initialMessage={proposal.responseMessage}
      />
    </ProposalExperience>
  );
}
