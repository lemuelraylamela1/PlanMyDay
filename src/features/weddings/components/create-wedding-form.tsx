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
import { AuthFormLoading } from "@/features/auth/components/auth-form-loading";
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
    try {
      const res = await createWeddingAction(values);
      if (!res.success) {
        toast.error(res.error);
        setPending(false);
        return;
      }
      toast.success(res.message ?? "Wedding created!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <div className="relative">
      {pending && <AuthFormLoading label="Creating your wedding…" />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-4 disabled:opacity-60">
          <div className="space-y-2">
            <Label htmlFor="title">Wedding title</Label>
            <Input id="title" placeholder="Our Wedding" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partner1Name">Groom</Label>
              <Input id="partner1Name" placeholder="Groom's name" {...register("partner1Name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner2Name">Bride</Label>
              <Input id="partner2Name" placeholder="Bride's name" {...register("partner2Name")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Wedding date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating wedding…
              </>
            ) : (
              "Create wedding"
            )}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
