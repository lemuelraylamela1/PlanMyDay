import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoading } from "@/components/shared/page-loading";
import { DashboardStatsSection } from "@/features/dashboard/components/dashboard-stats-section";
import { DashboardUpcomingTasksSection } from "@/features/dashboard/components/dashboard-upcoming-tasks-section";
import { DashboardActivitySection } from "@/features/dashboard/components/dashboard-activity-section";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<PageLoading label="Loading stats…" />}>
        <DashboardStatsSection />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<PageLoading label="Loading tasks…" className="min-h-[200px]" />}>
          <DashboardUpcomingTasksSection />
        </Suspense>
        <Suspense fallback={<PageLoading label="Loading activity…" className="min-h-[200px]" />}>
          <DashboardActivitySection />
        </Suspense>
      </div>
    </div>
  );
}
