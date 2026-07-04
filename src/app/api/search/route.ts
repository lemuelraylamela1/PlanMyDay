import { NextResponse } from "next/server";

import { getCurrentWedding } from "@/lib/wedding-context";
import { searchWedding } from "@/features/search/service";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const { wedding, user } = await getCurrentWedding();
    const limited = rateLimit(`search:${user.id}`, 30, 60_000);
    if (!limited.success) {
      return NextResponse.json({ results: [] }, { status: 429 });
    }
    const results = await searchWedding(wedding.id, q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 401 });
  }
}
