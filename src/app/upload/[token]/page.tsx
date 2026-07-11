import type { Metadata } from "next";
import { Camera } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveUploadToken } from "@/features/guest-uploads/service";
import { GuestUploadForm } from "@/features/guest-uploads/components/guest-upload-form";

export const metadata: Metadata = { title: "Share Your Memories" };

export default async function GuestUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const uploadToken = await resolveUploadToken(token);

  if (!uploadToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 to-background p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Upload is no longer available</CardTitle>
            <CardDescription>
              This upload link is invalid, has expired, or has been closed by the couple. Please
              contact them if you need help.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { wedding } = uploadToken;
  const coupleNames =
    [wedding.partner1Name, wedding.partner2Name].filter(Boolean).join(" & ") || wedding.title;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 via-background to-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <Camera className="h-10 w-10 text-primary" />
          <CardTitle className="text-2xl">Share Your Memories</CardTitle>
          <CardDescription className="text-base">{coupleNames}</CardDescription>
        </CardHeader>
        <CardContent>
          <GuestUploadForm token={token} coupleNames={coupleNames} />
        </CardContent>
      </Card>
    </div>
  );
}
