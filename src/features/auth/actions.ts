"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { signOut as authSignOut } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { generateVerificationCode, hashToken } from "@/lib/tokens";
import { sendEmail, baseEmailTemplate } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { ACTIVE_WEDDING_COOKIE } from "@/lib/wedding-context";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordWithCodeSchema,
  verifyEmailCodeSchema,
} from "@/features/auth/schemas";

const VERIFY_CODE_TTL_MS = 15 * 60 * 1000;
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

async function invalidateAuthTokens(userId: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
  await db.authToken.updateMany({
    where: { userId, purpose, usedAt: null },
    data: { usedAt: new Date() },
  });
}

async function issueVerificationCode(userId: string, email: string, name?: string | null) {
  const code = generateVerificationCode();
  await invalidateAuthTokens(userId, "EMAIL_VERIFICATION");
  await db.authToken.create({
    data: {
      userId,
      tokenHash: hashToken(code),
      purpose: "EMAIL_VERIFICATION",
      expires: new Date(Date.now() + VERIFY_CODE_TTL_MS),
    },
  });

  await sendEmail({
    to: email,
    subject: "Your PlanMyDay verification code",
    html: baseEmailTemplate(
      "Verify your email",
      `<p>Hi ${name ?? "there"},</p>
       <p>Your verification code is:</p>
       <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#b03a5b">${code}</p>
       <p style="font-size:12px;color:#888">This code expires in 15 minutes.</p>`,
    ),
    text: `Your PlanMyDay verification code is: ${code}. It expires in 15 minutes.`,
  });
}

async function issuePasswordResetCode(userId: string, email: string, name?: string | null) {
  const code = generateVerificationCode();
  await invalidateAuthTokens(userId, "PASSWORD_RESET");
  await db.authToken.create({
    data: {
      userId,
      tokenHash: hashToken(code),
      purpose: "PASSWORD_RESET",
      expires: new Date(Date.now() + RESET_CODE_TTL_MS),
    },
  });

  await sendEmail({
    to: email,
    subject: "Your PlanMyDay password reset code",
    html: baseEmailTemplate(
      "Reset your password",
      `<p>Hi ${name ?? "there"},</p>
       <p>Your password reset code is:</p>
       <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#b03a5b">${code}</p>
       <p style="font-size:12px;color:#888">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>`,
    ),
    text: `Your PlanMyDay password reset code is: ${code}. It expires in 15 minutes.`,
  });
}

async function findValidAuthToken(
  userId: string,
  code: string,
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
) {
  const record = await db.authToken.findFirst({
    where: {
      userId,
      purpose,
      usedAt: null,
      expires: { gt: new Date() },
      tokenHash: hashToken(code),
    },
    orderBy: { createdAt: "desc" },
  });
  return record;
}

export async function registerAction(
  input: unknown,
): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const { name, email, password } = parsed.data;
  const limited = rateLimit(`register:${email}`, 5, 60_000);
  if (!limited.success) return fail("Too many attempts. Please try again shortly.");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return fail("An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email, passwordHash, emailVerified: null },
  });

  await issueVerificationCode(user.id, email, name);

  return ok({ email }, "Check your email for a verification code.");
}

export async function verifyEmailCodeAction(input: unknown): Promise<ActionResult> {
  const parsed = verifyEmailCodeSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const { email, code } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return fail("Invalid verification code.");

  const record = await findValidAuthToken(user.id, code, "EMAIL_VERIFICATION");
  if (!record) return fail("Invalid or expired verification code.");

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return ok(undefined, "Email verified. You can now log in.");
}

export async function resendVerificationAction(email: string): Promise<ActionResult> {
  const limited = rateLimit(`resend-verify:${email}`, 3, 60_000);
  if (!limited.success) return fail("Too many requests. Please wait a moment.");

  const user = await db.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    await issueVerificationCode(user.id, user.email, user.name);
  }

  return ok(undefined, "If an unverified account exists, a new code has been sent.");
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Enter a valid email.", parsed.error.flatten().fieldErrors);
  }

  const { email } = parsed.data;
  const limited = rateLimit(`forgot:${email}`, 3, 60_000);
  if (!limited.success) return fail("Too many requests. Please wait a moment.");

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    await issuePasswordResetCode(user.id, email, user.name);
  }

  return ok(undefined, "If an account exists, a verification code has been sent.");
}

export async function resetPasswordWithCodeAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordWithCodeSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const { email, code, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return fail("Invalid verification code.");

  const record = await findValidAuthToken(user.id, code, "PASSWORD_RESET");
  if (!record) return fail("Invalid or expired verification code.");

  const passwordHash = await bcrypt.hash(password, 10);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
    db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return ok(undefined, "Password updated. You can now log in.");
}

export async function clearSessionCookiesAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_WEDDING_COOKIE);
}

/** Full logout: invalidate the server session and clear wedding + Auth.js cookies. */
export async function logoutAction(): Promise<void> {
  await authSignOut({ redirect: false });
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_WEDDING_COOKIE);
  clearAuthCookies(cookieStore);
}

/** Used by login form to show a verify-email hint without revealing account existence. */
export async function checkEmailVerificationAction(
  email: string,
): Promise<{ unverified: boolean }> {
  const user = await db.user.findUnique({
    where: { email },
    select: { emailVerified: true, passwordHash: true, deletedAt: true },
  });
  if (!user || user.deletedAt || !user.passwordHash) return { unverified: false };
  return { unverified: !user.emailVerified };
}
