/**
 * Supabase Transaction pooler (port 6543) requires `pgbouncer=true` so Prisma
 * disables prepared statements. Without it: "prepared statement s1 already exists".
 */
export function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const isSupabasePooler =
      parsed.port === "6543" || parsed.hostname.includes("pooler.supabase.com");

    if (isSupabasePooler) {
      if (!parsed.searchParams.has("pgbouncer")) {
        parsed.searchParams.set("pgbouncer", "true");
      }
      if (process.env.NODE_ENV === "production" && !parsed.searchParams.has("connection_limit")) {
        parsed.searchParams.set("connection_limit", "1");
      }
    }

    return parsed.toString();
  } catch {
    return url;
  }
}
