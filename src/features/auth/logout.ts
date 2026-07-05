"use client";

/**
 * Log out via Route Handler so Set-Cookie headers reach the browser in production.
 * Server Actions do not reliably clear httpOnly cookies on Vercel.
 */
export async function logout(): Promise<void> {
  const res = await fetch("/api/logout", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  window.location.href = "/";
}
