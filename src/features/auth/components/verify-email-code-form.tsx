"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyEmailCodeSchema, type VerifyEmailCodeInput } from "@/features/auth/schemas";
import { verifyEmailCodeAction } from "@/features/auth/actions";
import { AuthFormLoading } from "@/features/auth/components/auth-form-loading";
import { ResendVerification } from "@/features/auth/components/resend-verification";

export function VerifyEmailCodeForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [verified, setVerified] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyEmailCodeInput>({
    resolver: zodResolver(verifyEmailCodeSchema),
    defaultValues: { email: defaultEmail, code: "" },
  });

  React.useEffect(() => {
    if (!verified) return;
    const timeout = setTimeout(() => router.replace("/login"), 1500);
    return () => clearTimeout(timeout);
  }, [verified, router]);

  async function onSubmit(values: VerifyEmailCodeInput) {
    setPending(true);
    try {
      const res = await verifyEmailCodeAction(values);

      if (!res.success) {
        if (res.fieldErrors) {
          for (const [field, messages] of Object.entries(res.fieldErrors)) {
            if (messages?.[0]) setError(field as keyof VerifyEmailCodeInput, { message: messages[0] });
          }
        }
        toast.error(res.error);
        setPending(false);
        return;
      }

      setVerified(true);
      toast.success(res.message ?? "Email verified!");
    } catch {
      setPending(false);
    }
  }

  if (verified) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <div className="space-y-1">
          <p className="text-lg font-medium">Email verified!</p>
          <p className="text-sm text-muted-foreground">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {pending && <AuthFormLoading label="Verifying code…" />}
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify email"
            )}
          </Button>
        </fieldset>
      </form>
      <ResendVerification defaultEmail={defaultEmail} />
    </div>
  );
}
