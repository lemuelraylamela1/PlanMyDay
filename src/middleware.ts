import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
/** Keep in sync with ACTIVE_WEDDING_COOKIE in wedding-context (edge-safe literal). */
const WEDDING_COOKIE = "pmd_active_wedding";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth?.user?.id);
  const path = nextUrl.pathname;

  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/public") ||
    path.startsWith("/invite")
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  const isPublicRoute = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));
  const hasWedding = Boolean(req.cookies.get(WEDDING_COOKIE)?.value);
  const appHome = hasWedding ? "/dashboard" : "/onboarding";

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(appHome, nextUrl));
  }

  if (!isPublicRoute && !isLoggedIn) {
    const redirectUrl = new URL("/login", nextUrl);
    redirectUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
