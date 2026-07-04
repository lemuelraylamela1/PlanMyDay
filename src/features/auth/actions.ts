"use server";

import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { ActionResult, fail, ok } from "@/lib/action-result";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendEmail, baseEmailTemplate } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

async function issueVerificationEmail(userId: string, email: string, name?: string | null) {
  const rawToken = generateToken();
  await db.authToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      purpose: "EMAIL_VERIFICATION",
      expires: new Date(Date.now() + VERIFY_TTL_MS),
    },
  });

  const url = `${env.appUrl}/verify-email?token=${rawToken}`;
  await sendEmail({
    to: email,
    subject: "Verify your PlanMyDay email",
    html: baseEmailTemplate(
      "Welcome to PlanMyDay",
      `<p>Hi ${name ?? "there"},</p>
       <p>Confirm your email address to start planning your wedding.</p>
       <p><a href="${url}" style="display:inline-block;background:#b03a5b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Verify email</a></p>
       <p style="font-size:12px;color:#888">This link expires in 24 hours.</p>`,
    ),
    text: `Verify your email: ${url}`,
  });
}

export async function registerAction(input: unknown): Promise<ActionResult> {
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
    data: { name, email, passwordHash },
  });

  await issueVerificationEmail(user.id, email, name);
  return ok(undefined, "Account created. Check your email to verify your address.");
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  if (!token) return fail("Missing verification token.");

  const record = await db.authToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.purpose !== "EMAIL_VERIFICATION") {
    return fail("This verification link is invalid.");
  }
  if (record.usedAt) return fail("This link has already been used.");
  if (record.expires < new Date()) return fail("This verification link has expired.");

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
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
  // Always report success to avoid account enumeration.
  if (user && !user.emailVerified) {
    await issueVerificationEmail(user.id, user.email, user.name);
  }
  return ok(undefined, "If an unverified account exists, a new link has been sent.");
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
    const rawToken = generateToken();
    await db.authToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        purpose: "PASSWORD_RESET",
        expires: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    const url = `${env.appUrl}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: email,
      subject: "Reset your PlanMyDay password",
      html: baseEmailTemplate(
        "Reset your password",
        `<p>We received a request to reset your password.</p>
         <p><a href="${url}" style="display:inline-block;background:#b03a5b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
         <p style="font-size:12px;color:#888">This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
      ),
      text: `Reset your password: ${url}`,
    });
  }

  return ok(undefined, "If an account exists, a reset link has been sent.");
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
  }

  const { token, password } = parsed.data;
  const record = await db.authToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.purpose !== "PASSWORD_RESET") {
    return fail("This reset link is invalid.");
  }
  if (record.usedAt) return fail("This link has already been used.");
  if (record.expires < new Date()) return fail("This reset link has expired.");

  const passwordHash = await bcrypt.hash(password, 10);
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return ok(undefined, "Password updated. You can now log in.");
}
