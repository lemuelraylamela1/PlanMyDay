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
import { GoogleButton } from "@/features/auth/components/google-button";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setPending(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setPending(false);

    if (res?.error) {
      if (res.code === "email_not_verified") {
        toast.error("Please verify your email before logging in.");
        router.push("/verify-email");
        return;
      }
      toast.error("Invalid email or password.");
      return;
    }
    toast.success("Welcome back!");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Log in
      </Button>

      {googleEnabled && (
        <>
          <div className="relative py-2 text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-card px-2">or</span>
            <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
          </div>
          <GoogleButton callbackUrl={callbackUrl} />
        </>
      )}
    </form>
  );
}
