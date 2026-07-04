"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { weddingSettingsSchema, type WeddingSettingsInput } from "@/features/weddings/schemas";
import { updateWeddingSettingsAction } from "@/features/weddings/actions";

interface Props {
  weddingId: string;
  defaults: WeddingSettingsInput;
}

export function AppearanceForm({ weddingId, defaults }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const { register, handleSubmit } = useForm<WeddingSettingsInput>({
    resolver: zodResolver(weddingSettingsSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: WeddingSettingsInput) {
    setPending(true);
    const res = await updateWeddingSettingsAction(weddingId, values);
    setPending(false);
    if (res.success) {
      toast.success(res.message ?? "Saved.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Story & contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="story">Your story</Label>
            <Textarea id="story" rows={5} {...register("story")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dressCode">Dress code</Label>
            <Input id="dressCode" {...register("dressCode")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact phone</Label>
            <Input id="contactPhone" {...register("contactPhone")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme & typography</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="themeKey">Theme</Label>
            <Input id="themeKey" placeholder="classic" {...register("themeKey")} />
          </div>
          <div className="space-y-2" />
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary color</Label>
            <Input id="primaryColor" type="color" className="h-10 w-full" {...register("primaryColor")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary color</Label>
            <Input id="secondaryColor" type="color" className="h-10 w-full" {...register("secondaryColor")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontHeading">Heading font</Label>
            <Input id="fontHeading" {...register("fontHeading")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontBody">Body font</Label>
            <Input id="fontBody" {...register("fontBody")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save appearance
        </Button>
      </div>
    </form>
  );
}
