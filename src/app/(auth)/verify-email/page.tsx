import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailAction } from "@/features/auth/actions";
import { ResendVerification } from "@/features/auth/components/resend-verification";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    const res = await verifyEmailAction(token);
    return (
      <Card>
        <CardHeader className="items-center text-center">
          {res.success ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          ) : (
            <XCircle className="h-12 w-12 text-destructive" />
          )}
          <CardTitle className="text-2xl">
            {res.success ? "Email verified" : "Verification failed"}
          </CardTitle>
          <CardDescription>{res.success ? res.message : res.error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Continue to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          Please verify your email address to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResendVerification />
        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
