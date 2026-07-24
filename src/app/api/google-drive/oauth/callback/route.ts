import { NextResponse } from "next/server";
import { google } from "googleapis";

import { env } from "@/lib/env";
import { DRIVE_SCOPE } from "@/lib/google-drive-auth";
import { getGoogleDriveOAuthRedirectUri } from "@/lib/google-drive-oauth-config";

function htmlPage(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    code, pre { background: #f4f4f5; padding: 0.75rem; border-radius: 0.5rem; display: block; overflow-x: auto; word-break: break-all; }
    h1 { font-size: 1.5rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

/** OAuth callback — exchanges code for refresh token (one-time setup). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");

  if (error) {
    return new NextResponse(
      htmlPage(
        "Authorization failed",
        `<p>Google returned: <strong>${error}</strong></p>
         <p>Make sure this redirect URI is added in Google Cloud Console (Web client):</p>
         <code>${getGoogleDriveOAuthRedirectUri()}</code>`,
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (!code) {
    return new NextResponse(htmlPage("Missing code", "<p>No authorization code received.</p>"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!env.googleDriveClientId || !env.googleDriveClientSecret) {
    return new NextResponse(
      htmlPage("Not configured", "<p>Set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET in .env</p>"),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  try {
    const redirectUri = getGoogleDriveOAuthRedirectUri();
    const oauth2 = new google.auth.OAuth2(
      env.googleDriveClientId,
      env.googleDriveClientSecret,
      redirectUri,
    );

    const { tokens } = await oauth2.getToken(code);

    if (!tokens.refresh_token) {
      return new NextResponse(
        htmlPage(
          "No refresh token",
          `<p>Google did not return a refresh token.</p>
           <p>Revoke access at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>, then try again.</p>
           <p><a href="/api/google-drive/oauth/start">Restart authorization</a></p>`,
        ),
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }

    return new NextResponse(
      htmlPage(
        "Google Drive connected",
        `<p>Signed in for <strong>${env.googleDriveUserEmail}</strong>.</p>
         <p>Add this line to your <code>.env</code> file, then restart the dev server:</p>
         <pre>GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
         <p>Scope granted: ${DRIVE_SCOPE}</p>`,
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token exchange failed.";
    return new NextResponse(
      htmlPage(
        "Setup failed",
        `<p>${message}</p>
         <p>Confirm redirect URI in Google Cloud Console:</p>
         <code>${getGoogleDriveOAuthRedirectUri()}</code>
         <p><a href="/api/google-drive/oauth/start">Try again</a></p>`,
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}
