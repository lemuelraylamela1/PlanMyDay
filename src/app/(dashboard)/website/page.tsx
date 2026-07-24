import type { Metadata } from "next";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const previewUrl = env.rsvpAppUrl;
  const previewConfigured = Boolean(previewUrl);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website"
        description="Configure your public wedding website. The guest RSVP experience is hosted separately and embedded below."
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
      <Card>
        <CardHeader>
          <CardTitle>RSVP Website Preview</CardTitle>
          <CardDescription>
            {previewConfigured ? (
              <>
                Embedded preview from <code>{previewUrl}</code>. Personalized guest names appear when a valid
                invitation token is present in the URL.
              </>
            ) : (
              <>
                Set <code>NEXT_PUBLIC_RSVP_APP_URL</code> to your deployed RSVP site URL to enable the preview
                and guest invitation links.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {previewConfigured ? (
            <iframe
              title="RSVP website preview"
              src={previewUrl}
              className="h-[720px] w-full rounded-md border bg-white"
              loading="lazy"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Preview unavailable until the RSVP app URL is configured.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
