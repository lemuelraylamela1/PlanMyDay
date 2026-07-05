import { cookies } from "next/headers";

import { signOut } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { ACTIVE_WEDDING_COOKIE } from "@/lib/wedding-context";

/** Invalidates Auth.js session and clears app cookies. Use from Route Handlers, not Server Actions. */
export async function performLogout() {
  await signOut({ redirect: false });
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_WEDDING_COOKIE);
  clearAuthCookies(cookieStore);
}
