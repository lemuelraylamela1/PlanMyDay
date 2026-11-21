import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/** Social / chat crawlers that only need Open Graph HTML. */
const SHARE_BOT_UA =
  /facebookexternalhit|Facebot|Instagram|WhatsApp|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|SkypeUriPreview|Viber|Linespider|Pinterest|redditbot|Applebot|Googlebot/i;

const INVITE_TITLE = "You're Invited — Lemuel &amp; Grazielle's Wedding";
const INVITE_DESCRIPTION =
  "Join us as we celebrate our wedding day. Open your invitation to view the details and RSVP.";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inviteShareHtml(inviteUrl: string, imageUrl: string) {
  const url = escapeHtml(inviteUrl);
  const image = escapeHtml(imageUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${INVITE_TITLE}</title>
<meta name="description" content="${INVITE_DESCRIPTION}"/>
<link rel="canonical" href="${url}"/>
<link rel="image_src" href="${image}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Lemuel &amp; Grazielle"/>
<meta property="og:title" content="${INVITE_TITLE}"/>
<meta property="og:description" content="${INVITE_DESCRIPTION}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:secure_url" content="${image}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="Lemuel and Grazielle — You're invited"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${INVITE_TITLE}"/>
<meta name="twitter:description" content="${INVITE_DESCRIPTION}"/>
<meta name="twitter:image" content="${image}"/>
</head>
<body>
  <h1>${INVITE_TITLE}</h1>
  <p>${INVITE_DESCRIPTION}</p>
  <p><a href="${url}">Open invitation</a></p>
  <img src="${image}" alt="Lemuel and Grazielle — You're invited" width="1200" height="630"/>
</body>
</html>`;
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth?.user?.id);
  const path = nextUrl.pathname;
  const userAgent = req.headers.get("user-agent") ?? "";

  // Serve a tiny OG document to chat crawlers so Messenger/Instagram/WhatsApp
  // get a clean preview (no auth cookies / RSC stream). Humans still get the app.
  if (path.startsWith("/invite") && SHARE_BOT_UA.test(userAgent)) {
    const origin = nextUrl.origin;
    const inviteUrl = `${origin}${path}`;
    const imageUrl = `${origin}/og-invite-share.jpg`;
    return new NextResponse(inviteShareHtml(inviteUrl, imageUrl), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/logout") ||
    path.startsWith("/api/public") ||
    path.startsWith("/api/google-drive/oauth") ||
    path.startsWith("/invite") ||
    path.startsWith("/proposal") ||
    path.startsWith("/upload") ||
    path.startsWith("/check-in/") ||
    path.startsWith("/dev/")
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  const isPublicRoute = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
