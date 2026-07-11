/** Centralized, typed access to runtime environment values. */
import { normalizePrivateKey } from "@/lib/google-credentials";

function readEnv(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  appUrl: readEnv("NEXT_PUBLIC_APP_URL") || "http://localhost:3000",
  authSecret: readEnv("AUTH_SECRET"),
  googleId: readEnv("AUTH_GOOGLE_ID"),
  googleSecret: readEnv("AUTH_GOOGLE_SECRET"),
  emailFrom: readEnv("EMAIL_FROM") || "PlanMyDay <no-reply@planmyday.app>",
  smtpHost: readEnv("SMTP_HOST") || "smtp.gmail.com",
  smtpPort: Number(readEnv("SMTP_PORT") || "587"),
  smtpUser: readEnv("SMTP_USER"),
  smtpPass: readEnv("SMTP_PASS"),
  isProd: process.env.NODE_ENV === "production",
  guestMediaStorageDriver: readEnv("GUEST_MEDIA_STORAGE_DRIVER") || "google-drive",
  googleDriveServiceAccountEmail: readEnv("GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL"),
  get googleDriveServiceAccountPrivateKey() {
    return normalizePrivateKey(readEnv("GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY"));
  },
  googleDriveRootFolderId: readEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID"),
} as const;

export const isGoogleAuthEnabled = Boolean(env.googleId && env.googleSecret);

export const isSmtpConfigured = Boolean(env.smtpUser && env.smtpPass);
