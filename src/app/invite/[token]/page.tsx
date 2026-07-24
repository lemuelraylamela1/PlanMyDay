import type { Metadata } from "next";
import { CalendarHeart, MapPin } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { resolveInvitation, markInvitationOpened } from "@/features/invitations/service";
import { RsvpForm } from "@/features/invitations/components/rsvp-form";
import { formatGuestDisplayName } from "@/features/guests/display-name";

export const metadata: Metadata = { title: "You're Invited" };

/**
 * Public, token-based invitation boundary.
 *
 * NOTE: This is the minimal integration point for the future rich, animated
 * public wedding-website & RSVP experience (to be implemented separately). It
 * intentionally renders only a functional RSVP so the admin app can be tested
 * end-to-end without the public site.
 */
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await resolveInvitation(token);

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 to-background p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired. Please contact the couple.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  await markInvitationOpened(token);

  const { guest, wedding } = invitation;
  const coupleNames =
    [wedding.partner1Name, wedding.partner2Name].filter(Boolean).join(" & ") || wedding.title;
  const guestName = formatGuestDisplayName(guest);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 via-background to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <CalendarHeart className="h-10 w-10 text-primary" />
          <CardTitle className="text-2xl">{coupleNames}</CardTitle>
          <CardDescription className="text-base">
            {wedding.date ? formatDate(wedding.date) : "Date to be announced"}
          </CardDescription>
          {wedding.venueName && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {wedding.venueName}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center">
            Dear <span className="font-medium">{guestName}</span>, we would be honored by your
            presence. Please let us know if you can join us.
          </p>
          <RsvpForm
            weddingId={wedding.id}
            guestId={guest.id}
            guestName={guestName}
            plusOneAllowed={guest.plusOneAllowed}
          />
        </CardContent>
      </Card>
    </div>
  );
}
