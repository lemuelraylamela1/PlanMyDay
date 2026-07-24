import { NextResponse } from "next/server";

import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { guestUploadListSchema } from "@/features/guest-uploads/schemas";
import { listGuestUploads } from "@/features/guest-uploads/service";

export async function GET(request: Request) {
  let wedding;
  try {
    ({ wedding } = await getCurrentWedding());
    await requireWeddingOwner(wedding.id);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = guestUploadListSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    order: searchParams.get("order") ?? undefined,
    mediaType: searchParams.get("mediaType") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
  }

  const result = await listGuestUploads(wedding.id, parsed.data);
  return NextResponse.json(result);
}
