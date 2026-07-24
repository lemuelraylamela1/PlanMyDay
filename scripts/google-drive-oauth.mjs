#!/usr/bin/env node
/**
 * Google Drive OAuth setup helper.
 *
 * 1. In Google Cloud Console → Credentials → your Web OAuth client:
 *    Add redirect URI: http://localhost:3000/api/google-drive/oauth/callback
 * 2. npm run dev
 * 3. npm run drive:auth  (opens the start URL)
 * 4. Sign in as planmyday.storage@gmail.com and paste the refresh token into .env
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error(".env not found");
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf8");

function readEnv(key) {
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) return "";
  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

const appUrl = readEnv("NEXT_PUBLIC_APP_URL") || readEnv("NEXTAUTH_URL") || "http://localhost:3000";
const startUrl = `${appUrl.replace(/\/$/, "")}/api/google-drive/oauth/start`;
const callbackUrl = `${appUrl.replace(/\/$/, "")}/api/google-drive/oauth/callback`;

console.log("\nGoogle Drive OAuth setup");
console.log("========================\n");
console.log("Before continuing, add this redirect URI in Google Cloud Console");
console.log("(APIs & Services → Credentials → Web client → Authorized redirect URIs):\n");
console.log(`  ${callbackUrl}\n`);
console.log("Make sure the OAuth client type is **Web application** (not Desktop).\n");
console.log("Then start the dev server (npm run dev) and open:\n");
console.log(`  ${startUrl}\n`);

try {
  if (process.platform === "win32") {
    execSync(`start "" "${startUrl}"`, { stdio: "ignore", shell: true });
  } else if (process.platform === "darwin") {
    execSync(`open "${startUrl}"`);
  } else {
    execSync(`xdg-open "${startUrl}"`);
  }
  console.log("Opened browser. Sign in as planmyday.storage@gmail.com.\n");
} catch {
  console.log("Could not open browser automatically — use the URL above.\n");
}
