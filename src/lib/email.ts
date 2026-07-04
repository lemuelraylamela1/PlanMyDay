import { env } from "@/lib/env";

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
 * Sends a transactional email. Falls back to console logging in development
 * (or when no provider is configured) so flows are testable without secrets.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!env.resendApiKey) {
    console.info("\n[email:dev] --------------------------------------------");
    console.info(`To:      ${input.to}`);
    console.info(`Subject: ${input.subject}`);
    console.info(input.text ?? input.html);
    console.info("[email:dev] --------------------------------------------\n");
    return { ok: true, id: "dev-log" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      return { ok: false, error };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
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
