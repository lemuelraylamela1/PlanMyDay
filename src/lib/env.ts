function readEnv(name: string): string {
  return process.env[name] ?? "";
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function parseOrigins(value: string): string[] {
  return value
    .split(",")
    .map((part) => normalizeOrigin(part.trim()))
    .filter(Boolean);
}

const isProd = process.env.NODE_ENV === "production";

const appUrl = readEnv("NEXT_PUBLIC_APP_URL") || (isProd ? "" : "http://localhost:3000");
const rsvpAppUrl = readEnv("NEXT_PUBLIC_RSVP_APP_URL") || (isProd ? "" : "http://localhost:3001");
const rsvpAllowedOriginRaw =
  readEnv("RSVP_ALLOWED_ORIGIN") || readEnv("NEXT_PUBLIC_RSVP_APP_URL") || (isProd ? "" : "http://localhost:3001");

/** Centralized, typed access to runtime environment values. */
export const env = {
  appUrl,
  rsvpAppUrl,
  rsvpAllowedOrigin: normalizeOrigin(rsvpAllowedOriginRaw.split(",")[0]?.trim() || rsvpAllowedOriginRaw),
  rsvpAllowedOrigins: Array.from(
    new Set([...parseOrigins(rsvpAllowedOriginRaw), ...parseOrigins(rsvpAppUrl)].filter(Boolean)),
  ),
  rsvpNotificationEmail: readEnv("RSVP_NOTIFICATION_EMAIL") || "lemuelraylameladev@gmail.com",
  authSecret: readEnv("AUTH_SECRET"),
  googleId: readEnv("AUTH_GOOGLE_ID"),
  googleSecret: readEnv("AUTH_GOOGLE_SECRET"),
  emailFrom: readEnv("EMAIL_FROM") || "PlanMyDay <no-reply@planmyday.app>",
  smtpHost: readEnv("SMTP_HOST") || "smtp.gmail.com",
  smtpPort: Number(readEnv("SMTP_PORT") || "587"),
  smtpUser: readEnv("SMTP_USER"),
  smtpPass: readEnv("SMTP_PASS"),
  isProd,
  guestMediaStorageDriver: readEnv("GUEST_MEDIA_STORAGE_DRIVER") || "google-drive",
  googleDriveUserEmail: readEnv("GOOGLE_DRIVE_USER_EMAIL") || "planmyday.storage@gmail.com",
  googleDriveClientId: readEnv("GOOGLE_DRIVE_CLIENT_ID") || readEnv("AUTH_GOOGLE_ID"),
  googleDriveClientSecret:
    readEnv("GOOGLE_DRIVE_CLIENT_SECRET") || readEnv("AUTH_GOOGLE_SECRET"),
  googleDriveRefreshToken: readEnv("GOOGLE_DRIVE_REFRESH_TOKEN"),
  googleDriveRootFolderId: readEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID"),
} as const;

export const isGoogleAuthEnabled = Boolean(env.googleId && env.googleSecret);

export const isGoogleDriveConfigured = Boolean(
  env.googleDriveClientId &&
    env.googleDriveClientSecret &&
    env.googleDriveRefreshToken &&
    env.googleDriveRootFolderId,
);

export const isSmtpConfigured = Boolean(env.smtpUser && env.smtpPass);

export function assertProductionEnv() {
  if (!env.isProd) return;

  const missing: string[] = [];
  if (!env.appUrl) missing.push("NEXT_PUBLIC_APP_URL");
  if (!env.rsvpAppUrl) missing.push("NEXT_PUBLIC_RSVP_APP_URL");
  if (!env.authSecret) missing.push("AUTH_SECRET");
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");

  if (missing.length > 0) {
    console.error(`[PlanMyDay] Missing required production env: ${missing.join(", ")}`);
  }
}
