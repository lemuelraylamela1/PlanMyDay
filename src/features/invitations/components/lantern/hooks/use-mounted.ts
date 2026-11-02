"use client";

import { useSyncExternalStore } from "react";

/** True only after the client has hydrated. Safe for SSR — server always returns false. */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
