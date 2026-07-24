import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getCurrentWedding } from "@/lib/wedding-context";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRecentActivity } from "@/features/dashboard/service";

export async function DashboardActivitySection() {
  const { wedding } = await getCurrentWedding();
  const activity = await getRecentActivity(wedding.id, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activity">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {activity.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{log.summary}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
