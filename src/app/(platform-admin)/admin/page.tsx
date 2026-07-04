import type { Metadata } from "next";
import { Users, Heart, UserPlus, Mail } from "lucide-react";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [users, weddings, newUsers, emails] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.wedding.count({ where: { deletedAt: null } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.emailDeliveryLog.count(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Overview" description="Key metrics across all tenants" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={users} icon={Users} />
        <StatCard label="Active weddings" value={weddings} icon={Heart} accent="info" />
        <StatCard label="New signups (7d)" value={newUsers} icon={UserPlus} accent="success" />
        <StatCard label="Emails sent" value={emails} icon={Mail} accent="warning" />
      </div>
    </div>
  );
}
