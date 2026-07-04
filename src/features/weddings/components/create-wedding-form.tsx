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
import { createWeddingSchema, type CreateWeddingInput } from "@/features/weddings/schemas";
import { createWeddingAction } from "@/features/weddings/actions";

export function CreateWeddingForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWeddingInput>({
    resolver: zodResolver(createWeddingSchema),
    defaultValues: { title: "Our Wedding" },
  });

  async function onSubmit(values: CreateWeddingInput) {
    setPending(true);
    const res = await createWeddingAction(values);
    setPending(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(res.message ?? "Wedding created!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Wedding title</Label>
        <Input id="title" placeholder="Our Wedding" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="partner1Name">Partner 1</Label>
          <Input id="partner1Name" placeholder="e.g. Alex" {...register("partner1Name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partner2Name">Partner 2</Label>
          <Input id="partner2Name" placeholder="e.g. Sam" {...register("partner2Name")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Wedding date</Label>
        <Input id="date" type="date" {...register("date")} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Create wedding
      </Button>
    </form>
  );
}
