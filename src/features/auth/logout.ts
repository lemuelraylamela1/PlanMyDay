"use client";

import { logoutAction } from "@/features/auth/actions";

export async function logout(): Promise<void> {
  await logoutAction();
  // Hard navigation clears SessionProvider cache and ensures cookies are gone.
  window.location.href = "/";
}
