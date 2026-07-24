import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { PageHeader } from "@/components/shared/page-header";
import { getOwnerUploadLink } from "@/features/guest-uploads/service";
import { GuestUploadsClient } from "@/features/guest-uploads/components/guest-uploads-client";

export const metadata: Metadata = { title: "Guest Uploads" };

export default async function GuestUploadsPage() {
  const { wedding } = await getCurrentWedding();

  try {
    await requireWeddingOwner(wedding.id);
  } catch {
    redirect("/dashboard");
  }

  const link = await getOwnerUploadLink(wedding.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Uploads"
        description="Let guests share photos and videos via a secure QR code"
      />
      <GuestUploadsClient
        weddingId={wedding.id}
        initialEnabled={link?.isEnabled ?? true}
        initialUrl={link?.url ?? null}
        initialQr={link?.qr ?? null}
      />
    </div>
  );
}
