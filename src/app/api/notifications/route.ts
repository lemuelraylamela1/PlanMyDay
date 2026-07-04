import { NextResponse } from "next/server";

import { getCurrentWedding } from "@/lib/wedding-context";
import { countUnread, listNotifications } from "@/features/notifications/service";

export async function GET() {
  try {
    const { wedding, user } = await getCurrentWedding();
    const [items, unread] = await Promise.all([
      listNotifications(wedding.id, user.id),
      countUnread(wedding.id, user.id),
    ]);
    return NextResponse.json({ items, unread });
  } catch {
    return NextResponse.json({ items: [], unread: 0 }, { status: 401 });
  }
}
