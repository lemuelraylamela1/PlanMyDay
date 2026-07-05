"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas";
import { forgotPasswordAction } from "@/features/auth/actions";
import { AuthFormLoading } from "@/features/auth/components/auth-form-loading";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setPending(true);
    try {
      const res = await forgotPasswordAction(values);
      if (!res.success) {
        toast.error(res.error);
        setPending(false);
        return;
      }
      toast.success(res.message ?? "Verification code sent.");
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch {
      setPending(false);
    }
  }

  return (
    <div className="relative">
      {pending && <AuthFormLoading label="Sending code…" />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-4 disabled:opacity-60">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send verification code"
            )}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
