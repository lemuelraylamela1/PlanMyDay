import { getCurrentWedding } from "@/lib/wedding-context";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentActivity } from "@/features/dashboard/service";

export async function DashboardActivitySection() {
  const { wedding } = await getCurrentWedding();
  const activity = await getRecentActivity(wedding.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
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
