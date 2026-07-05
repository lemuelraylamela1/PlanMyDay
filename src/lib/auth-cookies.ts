import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

import { env } from "@/lib/env";

/** Auth.js session / callback cookie name prefixes (dev + production). */
const AUTH_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
];

const PROD_AUTH_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "__Secure-authjs.callback-url",
] as const;

const DEV_AUTH_COOKIE_NAMES = ["authjs.session-token", "authjs.callback-url"] as const;

type CookieStore = {
  getAll(): { name: string; value: string }[];
  delete: ResponseCookies["delete"];
};

function deleteOptionsFor(name: string) {
  const secure = name.startsWith("__Secure-") || name.startsWith("__Host-");
  return {
    path: "/",
    ...(secure ? { secure: true as const } : {}),
  };
}

function deleteAuthCookie(cookieStore: CookieStore, name: string) {
  cookieStore.delete({ name, ...deleteOptionsFor(name) });
}

/** Removes Auth.js session cookies, including chunked session tokens. */
export function clearAuthCookies(cookieStore: CookieStore) {
  for (const cookie of cookieStore.getAll()) {
    if (AUTH_COOKIE_PREFIXES.some((prefix) => cookie.name.startsWith(prefix))) {
      deleteAuthCookie(cookieStore, cookie.name);
    }
  }

  const knownNames = env.isProd ? PROD_AUTH_COOKIE_NAMES : DEV_AUTH_COOKIE_NAMES;
  for (const baseName of knownNames) {
    deleteAuthCookie(cookieStore, baseName);
    for (let i = 0; i < 8; i++) {
      deleteAuthCookie(cookieStore, `${baseName}.${i}`);
    }
  }
}
