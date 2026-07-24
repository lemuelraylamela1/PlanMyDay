import "server-only";

import { google } from "googleapis";

import { env } from "@/lib/env";
import { getGoogleDriveOAuthRedirectUri } from "@/lib/google-drive-oauth-config";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

/** OAuth2 client for planmyday.storage@gmail.com (refresh token in env). */
export function getDriveOAuth2Client() {
  const clientId = env.googleDriveClientId;
  const clientSecret = env.googleDriveClientSecret;
  const refreshToken = env.googleDriveRefreshToken;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Drive OAuth is not configured. Open /api/google-drive/oauth/start while the dev server is running.",
    );
  }

  const oauth2 = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getGoogleDriveOAuthRedirectUri(),
  );
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getDriveOAuth2Client() });
}

export { DRIVE_SCOPE };
