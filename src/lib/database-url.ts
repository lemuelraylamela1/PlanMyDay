/**
 * Supabase Transaction pooler (port 6543) requires `pgbouncer=true` so Prisma
 * disables prepared statements. Without it: "prepared statement s1" already exists".
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

      // connection_limit=1 causes P2024 timeouts when RSC runs parallel queries.
      const limit = parsed.searchParams.get("connection_limit");
      if (!limit || limit === "1") {
        parsed.searchParams.set("connection_limit", "5");
      }

      if (!parsed.searchParams.has("pool_timeout")) {
        parsed.searchParams.set("pool_timeout", "30");
      }
    }

    return parsed.toString();
  } catch {
    return url;
  }
}
