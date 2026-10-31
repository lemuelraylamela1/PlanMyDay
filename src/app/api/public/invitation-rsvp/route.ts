import { NextResponse } from "next/server";

import { assertProductionEnv, env } from "@/lib/env";
import { hashToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";
import { resolveInvitation } from "@/features/invitations/service";
import { invitationRsvpSubmitSchema } from "@/features/invitations/schemas";
import { submitRsvpForGuest } from "@/features/invitations/rsvp-service";

assertProductionEnv();

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

const allowedOrigins = new Set(
  [
    ...env.rsvpAllowedOrigins,
    env.appUrl,
    env.rsvpAppUrl,
  ]
    .filter(Boolean)
    .map((value) => normalizeOrigin(value)),
);

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) {
    return {
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  if (allowedOrigins.has(normalizeOrigin(origin))) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }

  return {
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Same-origin POSTs may omit Origin; allow those.
  if (!origin) return true;
  if (allowedOrigins.has(normalizeOrigin(origin))) return true;
  // Invite page lives on this app — always allow the request host itself.
  try {
    return normalizeOrigin(origin) === normalizeOrigin(new URL(request.url).origin);
  } catch {
    return false;
  }
}

export async function OPTIONS(request: Request) {
  if (!isOriginAllowed(request)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(request: Request) {
  const cors = getCorsHeaders(request);

  if (!isOriginAllowed(request)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403, headers: cors });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400, headers: cors });
  }

  const parsed = invitationRsvpSubmitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your RSVP details and try again." },
      { status: 400, headers: cors },
    );
  }

  const ip = getClientIp(request);
  const limited = rateLimit(
    `public-invitation-rsvp:post:${ip}:${hashToken(parsed.data.token)}`,
    10,
    60_000,
  );
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: cors },
    );
  }

  const invitation = await resolveInvitation(parsed.data.token);
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404, headers: cors });
  }

  const result = await submitRsvpForGuest({
    weddingId: invitation.wedding.id,
    guestId: invitation.guest.id,
    attending: parsed.data.attending,
    partySize: parsed.data.partySize,
    mealPreference: parsed.data.mealPreference,
    dietaryRestrictions: parsed.data.dietaryRestrictions,
    plusOneName: invitation.guest.plusOneAllowed ? parsed.data.plusOneName : undefined,
    message: parsed.data.message,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400, headers: cors });
  }

  return NextResponse.json({ success: true, message: result.message }, { headers: cors });
}
