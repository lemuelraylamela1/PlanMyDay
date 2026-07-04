import type { Metadata } from "next";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { sectionTypeEnum } from "@/features/website/schemas";
import { WebsiteConfig, type SectionRow } from "@/features/website/components/website-config";

export const metadata: Metadata = { title: "Website" };

export default async function WebsitePage() {
  const { wedding } = await getCurrentWedding();

  let sections = await db.websiteSection.findMany({
    where: { weddingId: wedding.id },
    orderBy: { order: "asc" },
  });

  if (sections.length === 0) {
    await db.websiteSection.createMany({
      data: sectionTypeEnum.options.map((type, index) => ({
        weddingId: wedding.id,
        type,
        order: index,
        isVisible: type !== "CUSTOM",
      })),
    });
    sections = await db.websiteSection.findMany({
      where: { weddingId: wedding.id },
      orderBy: { order: "asc" },
    });
  }

  const settings = await db.weddingWebsiteSettings.findUnique({
    where: { weddingId: wedding.id },
  });

  const sectionRows: SectionRow[] = sections.map((s) => ({
    id: s.id,
    type: s.type,
    isVisible: s.isVisible,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website"
        description="Configure your public wedding website. The site itself is rendered separately."
      />
      <WebsiteConfig
        weddingId={wedding.id}
        isPublished={settings?.isPublished ?? false}
        defaults={{
          seoTitle: settings?.seoTitle ?? "",
          seoDescription: settings?.seoDescription ?? "",
          customDomain: settings?.customDomain ?? "",
          passwordProtect: settings?.passwordProtect ?? false,
          accessPassword: settings?.accessPassword ?? "",
        }}
        sections={sectionRows}
      />
    </div>
  );
}
