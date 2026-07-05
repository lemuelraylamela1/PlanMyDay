import { NextResponse } from "next/server";

import { performLogout } from "@/lib/perform-logout";

export async function POST() {
  await performLogout();
  return NextResponse.json({ ok: true });
}
