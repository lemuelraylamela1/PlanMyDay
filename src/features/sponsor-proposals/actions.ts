"use server";

import { revalidatePath } from "next/cache";

import { ActionResult, fail, ok } from "@/lib/action-result";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import { getCurrentWedding } from "@/lib/wedding-context";
import {
  entourageDefaultMessage,
  entourageRoleLabels,
  parseEntourageRole,
  proposalResponseSchema,
  sponsorProposalSchema,
  type EntourageRole,
} from "@/features/sponsor-proposals/schemas";
import {
  getProposalQrDataUrl,
  issueProposalToken,
  resolveSponsorProposal,
} from "@/features/sponsor-proposals/service";

function clean(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

export type CsvEntourageRow = {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  facebookLink?: string;
  customMessage?: string;
};

export async function importSponsorProposalsAction(
  rows: CsvEntourageRow[],
): Promise<ActionResult<{ imported: number }>> {
  const { wedding, user } = await getCurrentWedding();
  if (!Array.isArray(rows) || rows.length === 0) return fail("No rows to import.");
  if (rows.length > 2000) return fail("Import is limited to 2000 rows at a time.");

  let imported = 0;
  for (const row of rows) {
    const name = row.name?.trim();
    if (!name) continue;

    const role: EntourageRole = parseEntourageRole(row.role) ?? "NINONG_AND_NINANG";
    const customMessage =
      clean(row.customMessage) ?? entourageDefaultMessage(role);

    await db.sponsorProposal.create({
      data: {
        weddingId: wedding.id,
        name,
        role,
        email: clean(row.email),
        phone: clean(row.phone),
        facebookLink: clean(row.facebookLink),
        customMessage,
      },
    });
    imported += 1;
  }

  if (imported === 0) {
    return fail("No valid rows found. Ensure a name column exists.");
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "CREATE",
    entityType: "SponsorProposal",
    summary: `Imported ${imported} entourage proposal(s) via CSV`,
  });

  revalidatePath("/sponsor-proposals");
  return ok({ imported }, `Imported ${imported} entourage member(s).`);
}

export async function saveSponsorProposalAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const parsed = sponsorProposalSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;
  const values = {
    role: data.role,
    name: data.name,
    email: clean(data.email),
    phone: clean(data.phone),
    facebookLink: clean(data.facebookLink),
    customMessage: data.customMessage,
  };
  const roleLabel = entourageRoleLabels[data.role];

  let proposalId = id;
  if (id) {
    const result = await db.sponsorProposal.updateMany({
      where: { id, weddingId: wedding.id, deletedAt: null },
      data: values,
    });
    if (result.count === 0) return fail("Proposal not found.");
  } else {
    const created = await db.sponsorProposal.create({
      data: { weddingId: wedding.id, ...values },
      select: { id: true },
    });
    proposalId = created.id;
  }

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: id ? "UPDATE" : "CREATE",
    entityType: "SponsorProposal",
    entityId: proposalId,
    summary: `${id ? "Updated" : "Added"} a ${roleLabel} proposal for ${data.name}`,
  });

  revalidatePath("/sponsor-proposals");
  return ok(undefined, "Proposal saved.");
}

export async function deleteSponsorProposalAction(id: string): Promise<ActionResult> {
  const { wedding, user } = await getCurrentWedding();
  const existing = await db.sponsorProposal.findFirst({
    where: { id, weddingId: wedding.id, deletedAt: null },
    select: { role: true },
  });
  if (!existing) return fail("Proposal not found.");

  const result = await db.sponsorProposal.updateMany({
    where: { id, weddingId: wedding.id, deletedAt: null },
    data: { deletedAt: new Date(), tokenHash: null },
  });
  if (result.count === 0) return fail("Proposal not found.");

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "DELETE",
    entityType: "SponsorProposal",
    entityId: id,
    summary: `Deleted a ${entourageRoleLabels[existing.role]} proposal`,
  });

  revalidatePath("/sponsor-proposals");
  return ok(undefined, "Proposal deleted.");
}

export async function generateProposalLinkAction(
  id: string,
): Promise<ActionResult<{ url: string; qr: string }>> {
  const { wedding, user } = await getCurrentWedding();
  const proposal = await db.sponsorProposal.findFirst({
    where: { id, weddingId: wedding.id, deletedAt: null },
    select: { id: true, name: true, tokenHash: true },
  });
  if (!proposal) return fail("Proposal not found.");

  const { url } = await issueProposalToken(wedding.id, proposal.id);
  const qr = await getProposalQrDataUrl(url);

  await logActivity({
    weddingId: wedding.id,
    userId: user.id,
    action: "INVITE",
    entityType: "SponsorProposal",
    entityId: proposal.id,
    summary: `${proposal.tokenHash ? "Regenerated" : "Generated"} proposal link for ${proposal.name}`,
  });

  revalidatePath("/sponsor-proposals");
  return ok({ url, qr });
}

export async function submitProposalResponseAction(input: unknown): Promise<ActionResult> {
  const parsed = proposalResponseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid response.");

  const proposal = await resolveSponsorProposal(parsed.data.token);
  if (!proposal) return fail("This proposal link is invalid or no longer available.");

  const result = await db.sponsorProposal.updateMany({
    where: {
      id: proposal.id,
      tokenHash: hashToken(parsed.data.token),
      deletedAt: null,
    },
    data: {
      status: parsed.data.status,
      responseMessage: clean(parsed.data.responseMessage),
      respondedAt: new Date(),
      openedAt: proposal.openedAt ?? new Date(),
    },
  });
  if (result.count === 0) return fail("This proposal could not be updated.");

  await logActivity({
    weddingId: proposal.weddingId,
    action: "RSVP_SUBMIT",
    entityType: "SponsorProposal",
    entityId: proposal.id,
    summary: `${proposal.name} ${parsed.data.status === "ACCEPTED" ? "accepted" : "declined"} the ${entourageRoleLabels[proposal.role]} proposal`,
  });

  revalidatePath("/sponsor-proposals");
  revalidatePath(`/proposal/${parsed.data.token}`);
  return ok(
    undefined,
    parsed.data.status === "ACCEPTED"
      ? "Thank you for saying yes!"
      : "Thank you for letting the couple know.",
  );
}
