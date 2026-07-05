import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Store,
  ListChecks,
  CalendarHeart,
} from "lucide-react";

import { getCurrentWedding } from "@/lib/wedding-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats } from "@/features/dashboard/service";
import { RsvpChart } from "@/features/dashboard/components/rsvp-chart";

export async function DashboardStatsSection() {
  const { wedding } = await getCurrentWedding();
  const stats = await getDashboardStats(wedding.id, wedding.date);

  return (
    <>
      <PageHeader
        title={wedding.title}
        description={
          wedding.date
            ? `${formatDate(wedding.date)}${wedding.venueName ? ` · ${wedding.venueName}` : ""}`
            : "Set your wedding date in Wedding settings"
        }
      >
        {stats.countdownDays !== null && (
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
            <CalendarHeart className="h-5 w-5 text-primary" />
            <div className="leading-tight">
              <p className="text-xl font-bold">{stats.countdownDays}</p>
              <p className="text-xs text-muted-foreground">days to go</p>
            </div>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Guests" value={stats.guests.total} icon={Users} />
        <StatCard label="Accepted" value={stats.guests.accepted} icon={CheckCircle2} accent="success" />
        <StatCard label="Declined" value={stats.guests.declined} icon={XCircle} accent="destructive" />
        <StatCard label="Pending" value={stats.guests.pending} icon={Clock} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>RSVP Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RsvpChart
              accepted={stats.guests.accepted}
              declined={stats.guests.declined}
              pending={stats.guests.pending}
            />
            <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Accepted
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Declined
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Pending
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Budget spent"
                value={formatCurrency(stats.budget.actual, wedding.currency)}
                hint={`of ${formatCurrency(stats.budget.estimated, wedding.currency)} estimated`}
                icon={Wallet}
                accent="info"
              />
              <StatCard
                label="Suppliers booked"
                value={`${stats.suppliers.booked}/${stats.suppliers.total}`}
                icon={Store}
              />
              <StatCard
                label="Tasks done"
                value={`${stats.tasks.completed}/${stats.tasks.total}`}
                icon={ListChecks}
                accent="success"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Task completion</span>
                <span className="font-medium">{stats.tasks.percent}%</span>
              </div>
              <Progress value={stats.tasks.percent} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
