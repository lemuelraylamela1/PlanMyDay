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
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { AuthFormLoading } from "@/features/auth/components/auth-form-loading";
import { GoogleButton } from "@/features/auth/components/google-button";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const preferredPath = params.get("callbackUrl");
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setPending(true);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password.");
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
            <Input
              id="password"
              type="password"
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

          {googleEnabled && (
            <>
              <div className="relative py-2 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-card px-2">or</span>
                <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
              </div>
              <GoogleButton callbackUrl={preferredPath ?? "/dashboard"} />
            </>
          )}
        </fieldset>
      </form>
    </div>
  );
}
