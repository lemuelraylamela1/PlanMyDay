"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { AuthFormLoading } from "@/features/auth/components/auth-form-loading";
import { checkEmailVerificationAction } from "@/features/auth/actions";

export const DEMO_ACCOUNT = {
  email: "demo@planmyday.app",
  password: "password123",
} as const;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const preferredPath = params.get("callbackUrl");
  const [pending, setPending] = React.useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setPending(true);
    setUnverifiedEmail(null);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        const hint = await checkEmailVerificationAction(values.email);
        if (hint.unverified) {
          setUnverifiedEmail(values.email);
          toast.error("Please verify your email before logging in.");
        } else {
          toast.error("Invalid email or password.");
        }
        setPending(false);
        return;
      }

      toast.success("Welcome back!");
      const destination =
        preferredPath &&
        preferredPath.startsWith("/") &&
        !preferredPath.startsWith("//") &&
        preferredPath !== "/login" &&
        preferredPath !== "/register"
          ? preferredPath
          : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  function fillDemoAccount() {
    setValue("email", DEMO_ACCOUNT.email, { shouldValidate: true, shouldDirty: true });
    setValue("password", DEMO_ACCOUNT.password, { shouldValidate: true, shouldDirty: true });
  }

  async function signInWithDemo() {
    fillDemoAccount();
    await onSubmit({ ...DEMO_ACCOUNT });
  }

  return (
    <div className="relative">
      {pending && <AuthFormLoading label="Logging you in…" />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-4 disabled:opacity-60">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in…
              </>
            ) : (
              "Log in"
            )}
          </Button>
          {unverifiedEmail && (
            <p className="text-center text-xs text-muted-foreground">
              Haven&apos;t verified yet?{" "}
              <Link
                href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                className="text-primary hover:underline"
              >
                Enter your verification code
              </Link>
            </p>
          )}
        </fieldset>
      </form>

      <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-3">
        <p className="text-xs font-medium text-foreground">Interviewer demo</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Email <span className="font-mono text-foreground">{DEMO_ACCOUNT.email}</span>
          <br />
          Password <span className="font-mono text-foreground">{DEMO_ACCOUNT.password}</span>
        </p>
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" size="sm" className="flex-1" disabled={pending} onClick={fillDemoAccount}>
            Fill form
          </Button>
          <Button type="button" size="sm" className="flex-1" disabled={pending} onClick={signInWithDemo}>
            {pending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Signing in…
              </>
            ) : (
              "Enter demo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
