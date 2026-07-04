import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { MediaLibrary, type MediaRow } from "@/features/media/components/media-library";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaPage() {
  const { wedding } = await getCurrentWedding();
  const assets = await db.mediaAsset.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const rows: MediaRow[] = assets.map((a) => ({
    id: a.id,
    type: a.type,
    url: a.url,
    fileName: a.fileName,
    category: a.category,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Media Library" description="Upload and organize your wedding files" />
      <MediaLibrary assets={rows} />
    </div>
  );
}
