"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  resetPasswordWithCodeSchema,
  type ResetPasswordWithCodeInput,
} from "@/features/auth/schemas";
import { forgotPasswordAction, resetPasswordWithCodeAction } from "@/features/auth/actions";
import { AuthFormLoading } from "@/features/auth/components/auth-form-loading";

export function ResetPasswordForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordWithCodeInput>({
    resolver: zodResolver(resetPasswordWithCodeSchema),
    defaultValues: { email: defaultEmail, code: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordWithCodeInput) {
    setPending(true);
    try {
      const res = await resetPasswordWithCodeAction(values);

      if (!res.success) {
        if (res.fieldErrors) {
          for (const [field, messages] of Object.entries(res.fieldErrors)) {
            if (messages?.[0]) {
              setError(field as keyof ResetPasswordWithCodeInput, { message: messages[0] });
            }
          }
        }
        toast.error(res.error);
        setPending(false);
        return;
      }

      toast.success(res.message ?? "Password updated.");
      router.replace("/login");
    } catch {
      setPending(false);
    }
  }

  async function onResend() {
    const email = getValues("email");
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setResending(true);
    const res = await forgotPasswordAction({ email });
    setResending(false);
    if (res.success) toast.success(res.message ?? "A new code has been sent.");
    else toast.error(res.error);
  }

  return (
    <div className="relative">
      {pending && <AuthFormLoading label="Updating password…" />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-4 disabled:opacity-60">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              {...register("code")}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting…
              </>
            ) : (
              "Reset password"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t get a code?{" "}
            <button
              type="button"
              className="text-primary hover:underline disabled:opacity-60"
              onClick={onResend}
              disabled={resending || pending}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </fieldset>
      </form>
    </div>
  );
}
