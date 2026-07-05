import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

/** Auth.js session / callback cookie name prefixes (dev + production). */
const AUTH_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
];

type CookieStore = {
  getAll(): { name: string; value: string }[];
  delete: ResponseCookies["delete"];
};

/** Removes Auth.js session cookies, including chunked session tokens. */
export function clearAuthCookies(cookieStore: CookieStore) {
  for (const cookie of cookieStore.getAll()) {
    if (AUTH_COOKIE_PREFIXES.some((prefix) => cookie.name.startsWith(prefix))) {
      cookieStore.delete(cookie.name);
    }
  }
}
