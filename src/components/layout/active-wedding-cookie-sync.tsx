"use client";

import * as React from "react";

import { syncActiveWeddingCookieAction } from "@/features/weddings/actions";

/** Syncs the session wedding cookie after the server resolves the active wedding from DB. */
export function ActiveWeddingCookieSync({ weddingId }: { weddingId: string }) {
  React.useEffect(() => {
    void syncActiveWeddingCookieAction(weddingId);
  }, [weddingId]);

  return null;
}
