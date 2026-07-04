"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Globe, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { websiteSettingsSchema, type WebsiteSettingsInput } from "@/features/website/schemas";
import {
  updateWebsiteSettingsAction,
  togglePublishAction,
  toggleSectionAction,
} from "@/features/website/actions";

export interface SectionRow {
  id: string;
  type: string;
  isVisible: boolean;
}

interface Props {
  weddingId: string;
  isPublished: boolean;
  defaults: WebsiteSettingsInput;
  sections: SectionRow[];
}

export function WebsiteConfig({ isPublished, defaults, sections }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [published, setPublished] = React.useState(isPublished);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<WebsiteSettingsInput>({
    resolver: zodResolver(websiteSettingsSchema),
    defaultValues: defaults,
  });

  const passwordProtect = watch("passwordProtect");

  async function onSubmit(values: WebsiteSettingsInput) {
    setPending(true);
    const res = await updateWebsiteSettingsAction(values);
    setPending(false);
    if (res.success) { toast.success(res.message ?? "Saved."); router.refresh(); }
    else toast.error(res.error);
  }

  async function onPublishToggle() {
    const next = !published;
    setPublished(next);
    const res = await togglePublishAction(next);
    if (res.success) { toast.success(res.message ?? "Updated."); router.refresh(); }
    else { setPublished(!next); toast.error(res.error); }
  }

  async function onSectionToggle(section: SectionRow) {
    const res = await toggleSectionAction(section.id, !section.isVisible);
    if (res.success) router.refresh();
    else toast.error(res.error);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Publish status
            </CardTitle>
            <CardDescription>Control whether your public wedding site is live.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={published ? "success" : "secondary"}>
              {published ? "Published" : "Draft"}
            </Badge>
            <Button variant={published ? "outline" : "default"} onClick={onPublishToggle}>
              {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO & domain</CardTitle>
              <CardDescription>
                Configuration only. Rendering is handled by the public site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO title</Label>
                <Input id="seoTitle" {...register("seoTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO description</Label>
                <Textarea id="seoDescription" rows={2} {...register("seoDescription")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom domain</Label>
                <Input id="customDomain" placeholder="ourwedding.com" {...register("customDomain")} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="passwordProtect">Password protect</Label>
                  <p className="text-xs text-muted-foreground">Require a password to view the site.</p>
                </div>
                <Switch
                  id="passwordProtect"
                  checked={passwordProtect}
                  onCheckedChange={(v) => setValue("passwordProtect", v)}
                />
              </div>
              {passwordProtect && (
                <div className="space-y-2">
                  <Label htmlFor="accessPassword">Access password</Label>
                  <Input id="accessPassword" {...register("accessPassword")} />
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Sections & visibility</CardTitle>
            <CardDescription>Toggle which sections appear on your public site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium capitalize">
                  {s.type.replace("_", " ").toLowerCase()}
                </span>
                <Switch checked={s.isVisible} onCheckedChange={() => onSectionToggle(s)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
