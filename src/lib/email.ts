import nodemailer from "nodemailer";

import { env, isSmtpConfigured } from "@/lib/env";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a transactional email via Gmail SMTP (Nodemailer).
 * Falls back to console logging when SMTP is not configured.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isSmtpConfigured) {
    console.info("\n[email:dev] --------------------------------------------");
    console.info(`To:      ${input.to}`);
    console.info(`Subject: ${input.subject}`);
    console.info(input.text ?? input.html);
    console.info("[email:dev] --------------------------------------------\n");
    return { ok: true, id: "dev-log" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: env.emailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    return { ok: true, id: info.messageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

export function baseEmailTemplate(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
    <h1 style="font-size:20px;color:#b03a5b;margin-bottom:16px">${title}</h1>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="font-size:12px;color:#888">Sent by PlanMyDay — your wedding planning companion.</p>
  </div>`;
}
