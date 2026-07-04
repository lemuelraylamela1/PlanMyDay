import { createHash, randomBytes } from "crypto";

/** Generate a cryptographically-secure URL-safe token. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Deterministically hash a token for safe storage/lookup. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
