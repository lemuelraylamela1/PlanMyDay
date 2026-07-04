"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateProfileAction,
  updateLocalizationAction,
  deleteWeddingAction,
} from "@/features/settings/actions";

export function ProfileForm({ name, locale }: { name: string; locale: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [values, setValues] = React.useState({ name, locale });

  async function save() {
    setPending(true);
    const res = await updateProfileAction(values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); router.refresh(); }
    else toast.error(res.error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your personal profile details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale">Language</Label>
          <Input id="locale" value={values.locale} onChange={(e) => setValues({ ...values, locale: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LocalizationForm({
  currency,
  timezone,
  locale,
}: {
  currency: string;
  timezone: string;
  locale: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [values, setValues] = React.useState({ currency, timezone, locale });

  async function save() {
    setPending(true);
    const res = await updateLocalizationAction(values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); router.refresh(); }
    else toast.error(res.error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Localization</CardTitle>
        <CardDescription>Currency, time zone and language for this wedding.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" maxLength={3} value={values.currency} onChange={(e) => setValues({ ...values, currency: e.target.value.toUpperCase() })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Time zone</Label>
          <Input id="timezone" value={values.timezone} onChange={(e) => setValues({ ...values, timezone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wlocale">Language</Label>
          <Input id="wlocale" value={values.locale} onChange={(e) => setValues({ ...values, locale: e.target.value })} />
        </div>
        <div className="sm:col-span-3 flex justify-end">
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DangerZone() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onDelete() {
    if (!confirm("Archive this wedding? You can restore it from the database if needed.")) return;
    setPending(true);
    const res = await deleteWeddingAction();
    setPending(false);
    if (res.success) {
      toast.success(res.message ?? "Archived.");
      router.push("/dashboard");
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>Archiving hides this wedding from your workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={onDelete} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Archive wedding
        </Button>
      </CardContent>
    </Card>
  );
}
