import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Social / chat crawlers that only need Open Graph HTML.
 * Includes Meta's newer fetchers (meta-externalagent / meta-externalfetcher /
 * facebookcatalog) used for Messenger link previews pasted on desktop —
 * without them those requests got the full app instead of the OG document.
 */
const SHARE_BOT_UA =
  /facebookexternalhit|Facebot|FacebookBot|meta-externalagent|meta-externalfetcher|facebookcatalog|Instagram|WhatsApp|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|SkypeUriPreview|Viber|Linespider|Pinterest|redditbot|Applebot|Googlebot|Iframely|Embedly/i;

const INVITE_TITLE = "You're Invited — Lemuel &amp; Grazielle's Wedding";
const INVITE_DESCRIPTION =
  "Join us as we celebrate our wedding day. Open your invitation to view the details and RSVP.";
const PROPOSAL_TITLE = "A Special Wedding Proposal";
const PROPOSAL_DESCRIPTION =
  "You have been invited to hold a special place in our wedding.";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function sharePreviewHtml({
  pageUrl,
  imageUrl,
  title,
  description,
  imageAlt,
  ctaLabel,
}: {
  pageUrl: string;
  imageUrl: string;
  title: string;
  description: string;
  imageAlt: string;
  ctaLabel: string;
}) {
  const url = escapeHtml(pageUrl);
  const image = escapeHtml(imageUrl);
  const alt = escapeHtml(imageAlt);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<link rel="canonical" href="${url}"/>
<link rel="image_src" href="${image}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Lemuel &amp; Grazielle"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:secure_url" content="${image}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${alt}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${image}"/>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p><a href="${url}">${ctaLabel}</a></p>
  <img src="${image}" alt="${alt}" width="1200" height="630"/>
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
  if (SHARE_BOT_UA.test(userAgent)) {
    const origin = nextUrl.origin;
    if (path.startsWith("/invite")) {
      const inviteUrl = `${origin}${path}`;
      const imageUrl = `${origin}/og-invite-share.jpg`;
      return new NextResponse(
        sharePreviewHtml({
          pageUrl: inviteUrl,
          imageUrl,
          title: INVITE_TITLE,
          description: INVITE_DESCRIPTION,
          imageAlt: "Lemuel and Grazielle — You're invited",
          ctaLabel: "Open invitation",
        }),
        {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        },
      );
    }

    if (path.startsWith("/proposal")) {
      const proposalUrl = `${origin}${path}`;
      const imageUrl = `${origin}/og-proposal-share.jpg`;
      return new NextResponse(
        sharePreviewHtml({
          pageUrl: proposalUrl,
          imageUrl,
          title: PROPOSAL_TITLE,
          description: PROPOSAL_DESCRIPTION,
          imageAlt: "Lemuel and Grazielle — A special wedding proposal",
          ctaLabel: "Open proposal",
        }),
        {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        },
      );
    }
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
