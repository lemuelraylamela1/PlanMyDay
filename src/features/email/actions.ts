"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { emailTemplateSchema } from "@/features/email/schemas";

export async function saveEmailTemplateAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = emailTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;

  if (id) {
    const res = await db.emailTemplate.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data: { name: d.name, kind: d.kind, subject: d.subject, body: d.body },
    });
    if (res.count === 0) return fail("Template not found.");
  } else {
    await db.emailTemplate.create({
      data: { weddingId: wedding.id, name: d.name, kind: d.kind, subject: d.subject, body: d.body },
    });
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entityType: "EmailTemplate",
    entityId: id ?? undefined,
    summary: `${id ? "Updated" : "Created"} email template ${d.name}`,
  });

  revalidatePath("/invitations/email");
  return ok(undefined, "Template saved.");
}

export async function deleteEmailTemplateAction(id: string): Promise<ActionResult> {
  const { wedding } = await getCurrentWedding();
  await db.emailTemplate.updateMany({
    where: { id, weddingId: wedding.id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/invitations/email");
  return ok(undefined, "Template deleted.");
}
