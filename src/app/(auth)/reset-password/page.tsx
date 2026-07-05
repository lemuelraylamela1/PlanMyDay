import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Enter the verification code from your email and choose a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!email ? (
          <p className="text-center text-sm text-muted-foreground">
            Start from the{" "}
            <Link href="/forgot-password" className="text-primary hover:underline">
              forgot password
            </Link>{" "}
            page to receive a code.
          </p>
        ) : (
          <Suspense fallback={null}>
            <ResetPasswordForm defaultEmail={email} />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}
