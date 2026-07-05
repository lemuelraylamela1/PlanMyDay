import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyEmailCodeForm } from "@/features/auth/components/verify-email-code-form";
import { SignOutLink } from "@/features/auth/components/sign-out-link";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={null}>
          <VerifyEmailCodeForm defaultEmail={email ?? ""} />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
          {" · "}
          <SignOutLink />
        </p>
      </CardContent>
    </Card>
  );
}
