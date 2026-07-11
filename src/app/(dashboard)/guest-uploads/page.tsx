import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOwnerUploadLink } from "@/features/guest-uploads/service";
import { UploadSharePanel } from "@/features/guest-uploads/components/upload-share-panel";
import {
  GuestUploadGallery,
  type GuestUploadRow,
} from "@/features/guest-uploads/components/guest-upload-gallery";

export const metadata: Metadata = { title: "Guest Uploads" };

export default async function GuestUploadsPage() {
  const { wedding } = await getCurrentWedding();

  try {
    await requireWeddingOwner(wedding.id);
  } catch {
    redirect("/dashboard");
  }

  const link = await getOwnerUploadLink(wedding.id);

  const uploads = await db.guestMediaUpload.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: { uploadedAt: "desc" },
  });

  const rows: GuestUploadRow[] = uploads.map((u) => ({
    id: u.id,
    guestName: u.guestName,
    message: u.message,
    fileName: u.fileName,
    mediaType: u.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
    uploadedAt: u.uploadedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Uploads"
        description="Let guests share photos and videos via a secure QR code"
      />
      <Tabs defaultValue="share">
        <TabsList>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="gallery">Gallery ({rows.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="share" className="mt-6">
          <UploadSharePanel
            initialEnabled={link?.isEnabled ?? true}
            initialUrl={link?.url ?? null}
            initialQr={link?.qr ?? null}
          />
        </TabsContent>
        <TabsContent value="gallery" className="mt-6">
          <GuestUploadGallery uploads={rows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
