import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/lib/db";
import { requireVerifiedUser } from "@/lib/authz";

export const ACTIVE_WEDDING_COOKIE = "pmd_active_wedding";

/**
 * Resolves the current tenant (wedding) for the signed-in user.
 * Honors the active-wedding cookie, falling back to the most recent membership.
 * Redirects to onboarding when the user has no wedding yet.
 */
export const getCurrentWedding = cache(async () => {
  const user = await requireVerifiedUser();
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(ACTIVE_WEDDING_COOKIE)?.value;

  if (cookieId) {
    const membership = await db.weddingMember.findUnique({
      where: { weddingId_userId: { weddingId: cookieId, userId: user.id } },
      include: { wedding: true },
    });
    if (membership && !membership.wedding.deletedAt) {
      return { wedding: membership.wedding, role: membership.role, user };
    }
  }

  const fallback = await db.weddingMember.findFirst({
    where: { userId: user.id, wedding: { deletedAt: null } },
    orderBy: { createdAt: "desc" },
    include: { wedding: true },
  });

  if (!fallback) redirect("/onboarding");
  return { wedding: fallback.wedding, role: fallback.role, user };
});

/** Lists all weddings the user can access (for the switcher). */
export const listUserWeddings = cache(async (userId: string) => {
  const memberships = await db.weddingMember.findMany({
    where: { userId, wedding: { deletedAt: null } },
    orderBy: { createdAt: "desc" },
    include: { wedding: { select: { id: true, title: true, date: true } } },
  });
  return memberships.map((m) => ({ ...m.wedding, role: m.role }));
});
