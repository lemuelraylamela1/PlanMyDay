"use client";

import { signOut } from "next-auth/react";

import { clearSessionCookiesAction } from "@/features/auth/actions";

export async function logout(): Promise<void> {
  await clearSessionCookiesAction();
  await signOut({ callbackUrl: "/", redirect: true });
}
