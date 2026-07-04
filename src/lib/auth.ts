import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/features/auth/schemas";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || user.deletedAt) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isEmailVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "COUPLE";
        const fromAdapter = (user as { emailVerified?: Date | boolean | null }).emailVerified;
        token.isEmailVerified =
          typeof user.isEmailVerified === "boolean"
            ? user.isEmailVerified
            : Boolean(fromAdapter);
      } else if (token.id) {
        // Keep role in sync and refresh verification until it becomes true
        // (so middleware updates after the user clicks the email link).
        const needsRole = !token.role;
        const needsVerifyCheck = token.isEmailVerified !== true;
        if (needsRole || needsVerifyCheck) {
          const dbUser = await db.user.findUnique({
            where: { id: String(token.id) },
            select: { role: true, emailVerified: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.isEmailVerified = Boolean(dbUser.emailVerified);
          }
        }
      }
      return token;
    },
  },
});
