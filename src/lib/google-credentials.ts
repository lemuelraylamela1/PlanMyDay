/**
 * Normalizes a PEM private key from env vars (local .env, Vercel, JSON exports).
 * Handles literal `\n`, surrounding quotes, and stray carriage returns.
 */
export function normalizePrivateKey(raw: string): string {
  if (!raw) return "";

  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  // JSON / Vercel / .env escaped newlines → real PEM line breaks
  key = key.replace(/\\n/g, "\n").replace(/\r/g, "");

  return key.trim();
}
