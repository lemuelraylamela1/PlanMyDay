/** Centralized, typed access to runtime environment values. */
export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "",
  googleId: process.env.AUTH_GOOGLE_ID ?? "",
  googleSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "PlanMyDay <no-reply@planmyday.app>",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  isProd: process.env.NODE_ENV === "production",
} as const;

export const isGoogleAuthEnabled = Boolean(env.googleId && env.googleSecret);
