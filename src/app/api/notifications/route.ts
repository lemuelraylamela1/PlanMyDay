import { NextResponse } from "next/server";

import { getCurrentWedding } from "@/lib/wedding-context";
import { getNotificationsPayload } from "@/features/notifications/service";

export async function GET() {
  try {
    const { wedding, user } = await getCurrentWedding();
    const payload = await getNotificationsPayload(wedding.id, user.id);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ items: [], unread: 0 }, { status: 401 });
  }
}
