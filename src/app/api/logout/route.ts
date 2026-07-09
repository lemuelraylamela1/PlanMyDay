import { NextResponse } from "next/server";

import { performLogout } from "@/lib/perform-logout";

export async function POST() {
  await performLogout();
  return NextResponse.json({ ok: true });
}

/** Clears session cookies then redirects home (used for stale-session recovery). */
export async function GET(request: Request) {
  await performLogout();
  return NextResponse.redirect(new URL("/", request.url));
}
