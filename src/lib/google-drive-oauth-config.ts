import { env } from "@/lib/env";

export const GOOGLE_DRIVE_OAUTH_CALLBACK_PATH = "/api/google-drive/oauth/callback";

export function getGoogleDriveOAuthRedirectUri() {
  return `${env.appUrl.replace(/\/$/, "")}${GOOGLE_DRIVE_OAUTH_CALLBACK_PATH}`;
}
