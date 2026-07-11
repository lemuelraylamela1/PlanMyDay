#!/usr/bin/env node
/**
 * Applies DB_MODE from .env (or CLI arg) to DATABASE_URL / DIRECT_URL.
 * Usage: npm run db:switch | npm run db:local | npm run db:supabase
 */
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error(".env not found");
  process.exit(1);
}

let content = fs.readFileSync(envPath, "utf8");

const modeArg = process.argv[2]?.toLowerCase();
const modeFromFile = content.match(/^DB_MODE=(.+)$/m)?.[1]?.replace(/["']/g, "").trim();
const mode = modeArg || modeFromFile || "local";

if (mode !== "local" && mode !== "supabase") {
  console.error('DB_MODE must be "local" or "supabase"');
  process.exit(1);
}

function readEnvValue(key) {
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match?.[1]?.trim();
}

const pairs = {
  local: {
    database: readEnvValue("LOCAL_DATABASE_URL"),
    direct: readEnvValue("LOCAL_DIRECT_URL"),
  },
  supabase: {
    database: readEnvValue("SUPABASE_DATABASE_URL"),
    direct: readEnvValue("SUPABASE_DIRECT_URL"),
  },
};

const { database, direct } = pairs[mode];
if (!database || !direct) {
  console.error(`Missing ${mode.toUpperCase()} URL variables in .env`);
  process.exit(1);
}

content = content.replace(/^DB_MODE=.*$/m, `DB_MODE=${mode}`);
content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${database}`);
content = content.replace(/^DIRECT_URL=.*$/m, `DIRECT_URL=${direct}`);

fs.writeFileSync(envPath, content);
console.log(`Database mode: ${mode}`);
