"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { logout } from "@/features/auth/logout";

export function SignOutLink() {
  const [pending, setPending] = React.useState(false);

  async function onSignOut() {
    setPending(true);
    try {
      await logout();
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-primary hover:underline disabled:opacity-60"
      onClick={onSignOut}
      disabled={pending}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? "Signing out…" : "Use a different account"}
    </button>
  );
}
