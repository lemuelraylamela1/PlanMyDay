import type { Metadata } from "next";

import { db } from "@/lib/db";
import { requireVerifiedUser } from "@/lib/authz";
import { getCurrentWedding } from "@/lib/wedding-context";
import { PageHeader } from "@/components/shared/page-header";
import {
  ProfileForm,
  LocalizationForm,
  DangerZone,
} from "@/features/settings/components/settings-forms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const sessionUser = await requireVerifiedUser();
  const { wedding, role } = await getCurrentWedding();
  const user = await db.user.findUnique({ where: { id: sessionUser.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and wedding preferences" />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm name={user?.name ?? ""} locale={user?.locale ?? "en-PH"} />
        <LocalizationForm currency={wedding.currency} timezone={wedding.timezone} locale={wedding.locale} />
      </div>
      {role === "OWNER" && <DangerZone />}
    </div>
  );
}
