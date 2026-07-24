"use client";

import * as React from "react";
import { Loader2, ScrollText } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useActivity } from "@/features/activity/hooks/use-activity";
import type { ActivityListResult } from "@/features/activity/schemas";

interface Props {
  weddingId: string;
  initialData: ActivityListResult;
}

export function ActivityFeed({ weddingId, initialData }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, error } = useActivity(
    weddingId,
    initialData,
  );

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (isPending && items.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading activity…
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load activity."}
      </p>
    );
  }

  if (total === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No activity yet"
        description="Actions you take will be recorded here."
      />
    );
  }

  return (
    <Card>
      <CardContent className="divide-y p-0">
        {items.map((log) => (
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

        <div ref={sentinelRef} className="flex items-center justify-center px-5 py-4">
          {isFetchingNextPage ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading more…
            </span>
          ) : hasNextPage ? (
            <span className="text-xs text-muted-foreground">Scroll for more</span>
          ) : (
            <span className="text-xs text-muted-foreground">End of activity</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
