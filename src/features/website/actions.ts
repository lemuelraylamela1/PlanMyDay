"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { websiteSettingsSchema, sectionTypeEnum } from "@/features/website/schemas";

function clean(v?: string | null) {
  return v && v.trim() !== "" ? v.trim() : null;
}

export async function updateWebsiteSettingsAction(input: unknown): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = websiteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;

  await db.weddingWebsiteSettings.upsert({
    where: { weddingId: wedding.id },
    create: {
      weddingId: wedding.id,
      seoTitle: clean(d.seoTitle),
      seoDescription: clean(d.seoDescription),
      customDomain: clean(d.customDomain),
      passwordProtect: d.passwordProtect,
      accessPassword: clean(d.accessPassword),
    },
    update: {
      seoTitle: clean(d.seoTitle),
      seoDescription: clean(d.seoDescription),
      customDomain: clean(d.customDomain),
      passwordProtect: d.passwordProtect,
      accessPassword: clean(d.accessPassword),
    },
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "WeddingWebsiteSettings",
    summary: "Updated website settings",
  });

  revalidatePath("/website");
  return ok(undefined, "Website settings saved.");
}

export async function togglePublishAction(publish: boolean): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  await db.weddingWebsiteSettings.upsert({
    where: { weddingId: wedding.id },
    create: { weddingId: wedding.id, isPublished: publish, publishedAt: publish ? new Date() : null },
    update: { isPublished: publish, publishedAt: publish ? new Date() : null },
  });
  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "PUBLISH",
    entityType: "WeddingWebsiteSettings",
    summary: publish ? "Published wedding website" : "Unpublished wedding website",
  });
  revalidatePath("/website");
  return ok(undefined, publish ? "Website published." : "Website unpublished.");
}

export async function toggleSectionAction(id: string, isVisible: boolean): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.websiteSection.updateMany({
    where: { id, weddingId: wedding.id },
    data: { isVisible },
  });
  revalidatePath("/website");
  return ok();
}

export async function ensureDefaultSectionsAction(): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  const count = await db.websiteSection.count({ where: { weddingId: wedding.id } });
  if (count > 0) return ok();

  const defaults = sectionTypeEnum.options;
  await db.websiteSection.createMany({
    data: defaults.map((type, index) => ({
      weddingId: wedding.id,
      type,
      order: index,
      isVisible: type !== "CUSTOM",
    })),
  });
  revalidatePath("/website");
  return ok(undefined, "Sections initialized.");
}
