import { NextResponse } from "next/server";
import { google } from "googleapis";

import { env } from "@/lib/env";
import { DRIVE_SCOPE } from "@/lib/google-drive-auth";
import { getGoogleDriveOAuthRedirectUri } from "@/lib/google-drive-oauth-config";

/** One-time setup: redirects to Google sign-in for Drive access. */
export async function GET() {
  if (!env.googleDriveClientId || !env.googleDriveClientSecret) {
    return NextResponse.json(
      { error: "Set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET in .env" },
      { status: 500 },
    );
  }

  const redirectUri = getGoogleDriveOAuthRedirectUri();
  const oauth2 = new google.auth.OAuth2(
    env.googleDriveClientId,
    env.googleDriveClientSecret,
    redirectUri,
  );

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_SCOPE],
    login_hint: env.googleDriveUserEmail,
  });

  return NextResponse.redirect(url);
}
