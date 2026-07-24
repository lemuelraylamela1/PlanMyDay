"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingAccess } from "@/lib/authz";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { sendEmail, baseEmailTemplate } from "@/lib/email";
import { issueInvitationToken } from "@/features/invitations/service";
import { formatGuestDisplayName } from "@/features/guests/display-name";
import { guestSchema } from "@/features/guests/schemas";

function clean(value?: string | null) {
  return value && value.trim() !== "" ? value.trim() : null;
}

export async function createGuestAction(input: unknown): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = guestSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;

  await db.guest.create({
    data: {
      weddingId: wedding.id,
      title: clean(d.title),
      firstName: d.firstName,
      lastName: d.lastName,
      preferredName: clean(d.preferredName),
      email: clean(d.email),
      phone: clean(d.phone),
      side: d.side,
      relationship: clean(d.relationship),
      rsvpStatus: d.rsvpStatus,
      mealPreference: clean(d.mealPreference),
      dietaryRestrictions: clean(d.dietaryRestrictions),
      plusOneAllowed: d.plusOneAllowed,
      plusOneName: clean(d.plusOneName),
      groupId: d.groupId ? d.groupId : null,
      notes: clean(d.notes),
    },
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "Guest",
    summary: `Added guest ${d.firstName} ${d.lastName}`,
  });

  revalidatePath("/guests");
  return ok(undefined, "Guest added.");
}

export async function updateGuestAction(id: string, input: unknown): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = guestSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }
  const d = parsed.data;

  const result = await db.guest.updateMany({
    where: { id, weddingId: wedding.id, deletedAt: null },
    data: {
      title: clean(d.title),
      firstName: d.firstName,
      lastName: d.lastName,
      preferredName: clean(d.preferredName),
      email: clean(d.email),
      phone: clean(d.phone),
      side: d.side,
      relationship: clean(d.relationship),
      rsvpStatus: d.rsvpStatus,
      mealPreference: clean(d.mealPreference),
      dietaryRestrictions: clean(d.dietaryRestrictions),
      plusOneAllowed: d.plusOneAllowed,
      plusOneName: clean(d.plusOneName),
      groupId: d.groupId ? d.groupId : null,
      notes: clean(d.notes),
    },
  });
  if (result.count === 0) return fail("Guest not found.");

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "Guest",
    entityId: id,
    summary: `Updated guest ${d.firstName} ${d.lastName}`,
  });

  revalidatePath("/guests");
  return ok(undefined, "Guest updated.");
}

export async function deleteGuestsAction(ids: string[]): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  if (ids.length === 0) return fail("No guests selected.");

  const result = await db.guest.updateMany({
    where: { id: { in: ids }, weddingId: wedding.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "DELETE",
    entityType: "Guest",
    summary: `Deleted ${result.count} guest(s)`,
  });

  revalidatePath("/guests");
  return ok(undefined, `Deleted ${result.count} guest(s).`);
}

export async function bulkInviteAction(ids: string[]): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  if (ids.length === 0) return fail("No guests selected.");

  const guests = await db.guest.findMany({
    where: { id: { in: ids }, weddingId: wedding.id, deletedAt: null },
  });

  let sent = 0;
  const coupleNames =
    [wedding.partner1Name, wedding.partner2Name].filter(Boolean).join(" & ") || wedding.title;

  for (const guest of guests) {
    const { url } = await issueInvitationToken(wedding.id, guest.id);
    if (guest.email) {
      const res = await sendEmail({
        to: guest.email,
        subject: `You're invited — ${wedding.title}`,
        html: baseEmailTemplate(
          `You're invited!`,
          `<p>Dear ${formatGuestDisplayName(guest)},</p>
           <p>${coupleNames} would love for you to join their celebration.</p>
           <p><a href="${url}" style="display:inline-block;background:#b03a5b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View invitation & RSVP</a></p>`,
        ),
        text: `You're invited! RSVP here: ${url}`,
      });
      await db.emailDeliveryLog.create({
        data: {
          weddingId: wedding.id,
          guestId: guest.id,
          toEmail: guest.email,
          subject: `You're invited — ${wedding.title}`,
          status: res.ok ? "SENT" : "FAILED",
          error: res.ok ? null : res.error,
          sentAt: res.ok ? new Date() : null,
        },
      });
      if (res.ok) sent += 1;
    }
    await db.guest.update({
      where: { id: guest.id },
      data: { invitationStatus: "SENT" },
    });
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "INVITE",
    entityType: "Guest",
    summary: `Sent ${sent} invitation(s)`,
  });

  revalidatePath("/guests");
  revalidatePath("/invitations");
  return ok(undefined, `Invitations generated. ${sent} email(s) sent.`);
}

interface CsvGuestRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  side?: string;
  relationship?: string;
  group?: string;
}

export async function importGuestsAction(rows: CsvGuestRow[]): Promise<ActionResult<{ imported: number }>> {
  const { wedding, user } = await getCurrentWedding();
  if (!Array.isArray(rows) || rows.length === 0) return fail("No rows to import.");
  if (rows.length > 2000) return fail("Import is limited to 2000 rows at a time.");

  const groupCache = new Map<string, string>();
  async function resolveGroup(name?: string) {
    if (!name || !name.trim()) return null;
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();
    if (groupCache.has(key)) return groupCache.get(key)!;
    const existing = await db.guestGroup.findFirst({
      where: { weddingId: wedding.id, name: trimmed, deletedAt: null },
    });
    const group =
      existing ?? (await db.guestGroup.create({ data: { weddingId: wedding.id, name: trimmed } }));
    groupCache.set(key, group.id);
    return group.id;
  }

  let imported = 0;
  for (const row of rows) {
    const firstName = row.firstName?.trim();
    const lastName = row.lastName?.trim();
    if (!firstName || !lastName) continue;

    const groupId = await resolveGroup(row.group);
    const side = ["BRIDE", "GROOM", "BOTH"].includes((row.side ?? "").toUpperCase())
      ? ((row.side ?? "").toUpperCase() as "BRIDE" | "GROOM" | "BOTH")
      : "BOTH";

    await db.guest.create({
      data: {
        weddingId: wedding.id,
        firstName,
        lastName,
        email: clean(row.email),
        phone: clean(row.phone),
        relationship: clean(row.relationship),
        side,
        groupId,
      },
    });
    imported += 1;
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "Guest",
    summary: `Imported ${imported} guest(s) via CSV`,
  });

  revalidatePath("/guests");
  return ok({ imported }, `Imported ${imported} guest(s).`);
}

export async function updateRsvpStatusAction(
  id: string,
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE",
): Promise<ActionResult> {
  await requireWeddingAccess((await getCurrentWedding()).wedding.id);
  const { wedding, user } = await getCurrentWedding();
  await db.guest.updateMany({
    where: { id, weddingId: wedding.id, deletedAt: null },
    data: { rsvpStatus: status },
  });
  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "Guest",
    entityId: id,
    summary: `Set RSVP to ${status}`,
  });
  revalidatePath("/guests");
  return ok();
}

export async function updateInvitationStatusAction(
  id: string,
  status: "NOT_SENT" | "SENT",
): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  await db.guest.updateMany({
    where: { id, weddingId: wedding.id, deletedAt: null },
    data: { invitationStatus: status },
  });
  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "UPDATE",
    entityType: "Guest",
    entityId: id,
    summary: `Set invitation status to ${status}`,
  });
  revalidatePath("/guests");
  revalidatePath("/invitations");
  return ok();
}
