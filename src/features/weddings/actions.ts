"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { requireVerifiedUser, requireWeddingAccess } from "@/lib/authz";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { ACTIVE_WEDDING_COOKIE } from "@/lib/wedding-context";
import {
  createWeddingSchema,
  updateWeddingSchema,
  weddingSettingsSchema,
} from "@/features/weddings/schemas";

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createWeddingAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireVerifiedUser();
  const parsed = createWeddingSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const { title, partner1Name, partner2Name, date } = parsed.data;
  const wedding = await db.wedding.create({
    data: {
      ownerId: user.id,
      title,
      partner1Name: partner1Name || null,
      partner2Name: partner2Name || null,
      date: toDate(date),
      status: "ACTIVE",
      settings: { create: {} },
      websiteSettings: { create: {} },
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "Wedding",
    entityId: wedding.id,
    summary: `Created wedding "${title}"`,
  });

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WEDDING_COOKIE, wedding.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return ok({ id: wedding.id }, "Wedding created!");
}

export async function switchWeddingAction(weddingId: string): Promise<ActionResult> {
  await requireWeddingAccess(weddingId);
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WEDDING_COOKIE, weddingId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/dashboard");
  return ok();
}

export async function updateWeddingAction(
  weddingId: string,
  input: unknown,
): Promise<ActionResult> {
  const { user } = await requireWeddingAccess(weddingId);
  const parsed = updateWeddingSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const d = parsed.data;
  await db.wedding.update({
    where: { id: weddingId },
    data: {
      title: d.title,
      subtitle: d.subtitle || null,
      partner1Name: d.partner1Name || null,
      partner2Name: d.partner2Name || null,
      date: toDate(d.date),
      ceremonyTime: toDate(d.ceremonyTime),
      receptionTime: toDate(d.receptionTime),
      venueName: d.venueName || null,
      venueAddress: d.venueAddress || null,
      currency: d.currency,
      timezone: d.timezone,
      rsvpDeadline: toDate(d.rsvpDeadline),
    },
  });

  await logActivity({
    weddingId,
    userId: user.id,
    action: "UPDATE",
    entityType: "Wedding",
    entityId: weddingId,
    summary: "Updated wedding details",
  });

  revalidatePath("/wedding");
  revalidatePath("/dashboard");
  return ok(undefined, "Wedding details saved.");
}

export async function updateWeddingSettingsAction(
  weddingId: string,
  input: unknown,
): Promise<ActionResult> {
  const { user } = await requireWeddingAccess(weddingId);
  const parsed = weddingSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const d = parsed.data;
  await db.weddingSettings.upsert({
    where: { weddingId },
    create: {
      weddingId,
      dressCode: d.dressCode || null,
      story: d.story || null,
      contactEmail: d.contactEmail || null,
      contactPhone: d.contactPhone || null,
      themeKey: d.themeKey,
      primaryColor: d.primaryColor,
      secondaryColor: d.secondaryColor,
      fontHeading: d.fontHeading,
      fontBody: d.fontBody,
    },
    update: {
      dressCode: d.dressCode || null,
      story: d.story || null,
      contactEmail: d.contactEmail || null,
      contactPhone: d.contactPhone || null,
      themeKey: d.themeKey,
      primaryColor: d.primaryColor,
      secondaryColor: d.secondaryColor,
      fontHeading: d.fontHeading,
      fontBody: d.fontBody,
    },
  });

  await logActivity({
    weddingId,
    userId: user.id,
    action: "UPDATE",
    entityType: "WeddingSettings",
    entityId: weddingId,
    summary: "Updated appearance & details",
  });

  revalidatePath("/wedding");
  return ok(undefined, "Settings saved.");
}
