import type { Metadata } from "next";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveCheckInSessionToken } from "@/features/check-in/service";
import { CheckInScanner } from "@/features/check-in/components/check-in-scanner";

export const metadata: Metadata = { title: "Guest Check-in" };

export default async function PublicCheckInPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await resolveCheckInSessionToken(token);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 to-background p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Check-in is not available</CardTitle>
            <CardDescription>
              This scanner link is invalid, has expired, or has been closed by the couple.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const coupleNames =
    [session.wedding.partner1Name, session.wedding.partner2Name].filter(Boolean).join(" & ") ||
    session.wedding.title;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 via-background to-background px-4 py-10">
      <CheckInScanner
        sessionToken={token}
        coupleNames={coupleNames}
        weddingTitle={session.wedding.title}
      />
    </div>
  );
}
