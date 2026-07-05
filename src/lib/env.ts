/** Centralized, typed access to runtime environment values. */
export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "",
  googleId: process.env.AUTH_GOOGLE_ID ?? "",
  googleSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "PlanMyDay <no-reply@planmyday.app>",
  smtpHost: process.env.SMTP_HOST ?? "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  isProd: process.env.NODE_ENV === "production",
} as const;

export const isGoogleAuthEnabled = Boolean(env.googleId && env.googleSecret);

export const isSmtpConfigured = Boolean(env.smtpUser && env.smtpPass);
