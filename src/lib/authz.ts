import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export class AuthorizationError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Returns the current session user or redirects to login. */
export const requireUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
});

/** Ensures the current user is signed in (email verification is currently disabled). */
export const requireVerifiedUser = cache(async () => {
  const user = await requireUser();
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, emailVerified: true, role: true },
  });
  if (!dbUser) redirect("/login");
  return dbUser;
});

/** Ensures the current user is a platform admin. */
export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
});

/**
 * Confirms the current user is a member of the given wedding.
 * Throws AuthorizationError when the user has no access.
 */
export async function requireWeddingAccess(weddingId: string) {
  const user = await requireUser();
  const membership = await db.weddingMember.findUnique({
    where: { weddingId_userId: { weddingId, userId: user.id } },
  });
  if (!membership && user.role !== "ADMIN") {
    throw new AuthorizationError("You do not have access to this wedding.");
  }
  return { user, membership };
}

/** Returns the user's active (most recent) wedding, or null if none exists. */
export const getActiveWeddingForUser = cache(async (userId: string) => {
  const membership = await db.weddingMember.findFirst({
    where: { userId, wedding: { deletedAt: null } },
    orderBy: { createdAt: "desc" },
    include: { wedding: true },
  });
  return membership?.wedding ?? null;
});
