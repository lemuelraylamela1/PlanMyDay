function readEnv(name: string): string {
  return process.env[name] ?? "";
}

/** Centralized, typed access to runtime environment values. */
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
