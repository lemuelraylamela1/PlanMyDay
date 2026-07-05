import Link from "next/link";

import { getCurrentWedding } from "@/lib/wedding-context";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUpcomingTasks } from "@/features/dashboard/service";

export async function DashboardUpcomingTasksSection() {
  const { wedding } = await getCurrentWedding();
  const upcoming = await getUpcomingTasks(wedding.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No upcoming tasks.{" "}
            <Link href="/tasks" className="text-primary hover:underline">
              Add one
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((task) => (
              <li key={task.id} className="flex items-center justify-between text-sm">
                <span>{task.title}</span>
                <Badge variant="secondary">{formatDate(task.deadline)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
