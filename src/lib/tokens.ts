import { createHash, randomBytes, randomInt } from "crypto";

/** Generate a cryptographically-secure URL-safe token. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Generate a 6-digit verification code. */
export function generateVerificationCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

/** Deterministically hash a token for safe storage/lookup. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
