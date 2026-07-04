"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resendVerificationAction } from "@/features/auth/actions";

export function ResendVerification() {
  const [pending, setPending] = React.useState(false);
  const [email, setEmail] = React.useState("");

  async function onResend() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setPending(true);
    const res = await resendVerificationAction(email);
    setPending(false);
    if (res.success) toast.success(res.message ?? "Verification email sent.");
    else toast.error(res.error);
  }

  return (
    <div className="space-y-3">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={onResend} className="w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Resend verification email
      </Button>
    </div>
  );
}
