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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateWeddingSchema, type UpdateWeddingInput } from "@/features/weddings/schemas";
import { updateWeddingAction } from "@/features/weddings/actions";

function toInput(value: Date | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
function toDateTimeInput(value: Date | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

interface Props {
  weddingId: string;
  defaults: UpdateWeddingInput;
}

export function WeddingDetailsForm({ weddingId, defaults }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateWeddingInput>({
    resolver: zodResolver(updateWeddingSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: UpdateWeddingInput) {
    setPending(true);
    const res = await updateWeddingAction(weddingId, values);
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
          <CardTitle>Wedding details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" placeholder="e.g. Together forever" {...register("subtitle")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partner1Name">Partner 1</Label>
            <Input id="partner1Name" {...register("partner1Name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partner2Name">Partner 2</Label>
            <Input id="partner2Name" {...register("partner2Name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Wedding date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rsvpDeadline">RSVP deadline</Label>
            <Input id="rsvpDeadline" type="date" {...register("rsvpDeadline")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ceremonyTime">Ceremony time</Label>
            <Input id="ceremonyTime" type="datetime-local" {...register("ceremonyTime")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receptionTime">Reception time</Label>
            <Input id="receptionTime" type="datetime-local" {...register("receptionTime")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Venue & locale</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="venueName">Venue name</Label>
            <Input id="venueName" {...register("venueName")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="venueAddress">Venue address</Label>
            <Input id="venueAddress" {...register("venueAddress")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency (ISO)</Label>
            <Input id="currency" maxLength={3} {...register("currency")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Time zone</Label>
            <Input id="timezone" placeholder="e.g. America/New_York" {...register("timezone")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

export { toInput, toDateTimeInput };
