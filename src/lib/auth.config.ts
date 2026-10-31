import type { NextAuthConfig } from "next-auth";

import { env } from "@/lib/env";

/**
 * Edge-compatible Auth.js configuration (no database or Node-only deps).
 * Used by middleware for lightweight route protection. The full config in
 * `auth.ts` extends this with the Prisma adapter and Credentials provider.
 */
/** Secure cookies only on HTTPS — production `next start` on http://localhost must still log in. */
const useSecureCookies = env.appUrl.startsWith("https://");

export const authConfig = {
  secret: env.authSecret,
  // Required so Auth.js accepts localhost / reverse-proxy hosts (avoids UntrustedHost).
  trustHost: true,
  session: {
    strategy: "jwt",
    // Session JWT/cookie lifetime while the browser keeps the cookie (Auth.js sets expires on login).
    maxAge: 60 * 60 * 8,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    // Custom middleware owns public/protected routing; always allow the request through.
    authorized() {
      return true;
    },
    session({ session, token }) {
      const id = token.id ?? token.sub;
      if (id) session.user.id = String(id);
      if (token.role) session.user.role = token.role as "COUPLE" | "ADMIN";
      return session;
    },
  },
} satisfies NextAuthConfig;
