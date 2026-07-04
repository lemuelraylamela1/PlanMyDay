import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  // Allow API auth, public invitation endpoints, and static assets through.
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/public") ||
    path.startsWith("/invite")
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  const isPublicRoute = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
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
