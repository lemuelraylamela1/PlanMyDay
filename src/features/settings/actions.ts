"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { ACTIVE_WEDDING_COOKIE } from "@/lib/wedding-context";

const profileSchema = z.object({
  name: z.string().min(2, "Enter your name").max(80),
  locale: z.string().min(2).max(10).default("en-US"),
});

const localizationSchema = z.object({
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1).max(60),
  locale: z.string().min(2).max(10),
});

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, locale: parsed.data.locale },
  });
  revalidatePath("/settings");
  return ok(undefined, "Profile updated.");
}

export async function updateLocalizationAction(input: unknown): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  const parsed = localizationSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  await db.wedding.update({
    where: { id: wedding.id },
    data: {
      currency: parsed.data.currency,
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
    },
  });
  revalidatePath("/settings");
  return ok(undefined, "Localization saved.");
}

export async function deleteWeddingAction(): Promise<ActionResult> {
  const { wedding, role } = await getCurrentWedding();
  if (role !== "OWNER") return fail("Only the owner can delete this wedding.");
  await db.wedding.update({
    where: { id: wedding.id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_WEDDING_COOKIE);
  return ok(undefined, "Wedding archived.");
}
