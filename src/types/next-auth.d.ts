import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      /** Present on new sessions; omitted on legacy JWTs until refreshed. */
      isEmailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    isEmailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    isEmailVerified?: boolean;
  }
}
