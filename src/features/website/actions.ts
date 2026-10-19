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

export async function addGalleryItemAction(mediaId: string): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const media = await db.mediaAsset.findFirst({
    where: { id: mediaId, weddingId: wedding.id, type: "IMAGE", deletedAt: null },
    select: { id: true, fileName: true },
  });
  if (!media) return fail("Uploaded image not found.");

  const existing = await db.galleryItem.findFirst({
    where: { weddingId: wedding.id, mediaId },
    select: { id: true, deletedAt: true },
  });
  const last = await db.galleryItem.aggregate({
    where: { weddingId: wedding.id, deletedAt: null },
    _max: { order: true },
  });

  if (existing) {
    await db.galleryItem.update({
      where: { id: existing.id },
      data: { deletedAt: null, order: (last._max.order ?? -1) + 1 },
    });
  } else {
    await db.galleryItem.create({
      data: {
        weddingId: wedding.id,
        mediaId,
        order: (last._max.order ?? -1) + 1,
      },
    });
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "GalleryItem",
    entityId: existing?.id,
    summary: `Added ${media.fileName} to the wedding website gallery`,
  });
  revalidatePath("/website");
  revalidatePath("/proposal/[token]", "page");
  return ok(undefined, "Photo added to the website gallery.");
}

export async function updateGalleryCaptionAction(
  id: string,
  caption: string,
): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  if (caption.length > 500) return fail("Caption must be 500 characters or fewer.");
  const result = await db.galleryItem.updateMany({
    where: { id, weddingId: wedding.id, deletedAt: null },
    data: { caption: clean(caption) },
  });
  if (result.count === 0) return fail("Gallery photo not found.");
  revalidatePath("/website");
  revalidatePath("/proposal/[token]", "page");
  return ok(undefined, "Caption saved.");
}

export async function moveGalleryItemAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  const items = await db.galleryItem.findMany({
    where: { weddingId: wedding.id, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true },
  });
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return fail("Gallery photo not found.");
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return ok();

  const current = items[index]!;
  const other = items[swapIndex]!;
  await db.$transaction([
    db.galleryItem.update({ where: { id: current.id }, data: { order: other.order } }),
    db.galleryItem.update({ where: { id: other.id }, data: { order: current.order } }),
  ]);
  revalidatePath("/website");
  revalidatePath("/proposal/[token]", "page");
  return ok();
}

export async function removeGalleryItemAction(id: string): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const result = await db.galleryItem.updateMany({
    where: { id, weddingId: wedding.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (result.count === 0) return fail("Gallery photo not found.");
  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "DELETE",
    entityType: "GalleryItem",
    entityId: id,
    summary: "Removed a photo from the wedding website gallery",
  });
  revalidatePath("/website");
  revalidatePath("/proposal/[token]", "page");
  return ok(undefined, "Photo removed from the gallery.");
}
