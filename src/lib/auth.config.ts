import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { env, isGoogleAuthEnabled } from "@/lib/env";

/**
 * Edge-compatible Auth.js configuration (no database or Node-only deps).
 * Used by middleware for lightweight route protection. The full config in
 * `auth.ts` extends this with the Prisma adapter and Credentials provider.
 */
export const authConfig = {
  secret: env.authSecret,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(isGoogleAuthEnabled
      ? [Google({ clientId: env.googleId, clientSecret: env.googleSecret })]
      : []),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
