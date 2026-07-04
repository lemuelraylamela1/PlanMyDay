"use client";

import { signOut } from "next-auth/react";

export function SignOutLink() {
  return (
    <button
      type="button"
      className="text-primary hover:underline"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Use a different account
    </button>
  );
}
