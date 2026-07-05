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

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const preferredPath = params.get("callbackUrl");
  const [pending, setPending] = React.useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
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
    </div>
  );
}
