import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  const { wedding } = await getCurrentWedding();
  const logs = await db.activityLog.findMany({
    where: { weddingId: wedding.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" description="A log of important actions in your wedding" />

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No activity yet" description="Actions you take will be recorded here." />
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{log.action}</Badge>
                  <div>
                    <p className="text-sm">{log.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.user?.name ?? log.user?.email ?? "System"} · {log.entityType}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
