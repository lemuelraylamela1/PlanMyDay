import { NextResponse } from "next/server";

import { getCurrentWedding } from "@/lib/wedding-context";
import { activityListSchema } from "@/features/activity/schemas";
import { listActivityLogs } from "@/features/activity/service";

export async function GET(request: Request) {
  let wedding;
  try {
    ({ wedding } = await getCurrentWedding());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = activityListSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
  }

  const result = await listActivityLogs(wedding.id, parsed.data);
  return NextResponse.json(result);
}
