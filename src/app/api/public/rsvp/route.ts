import { NextResponse } from "next/server";

import { assertProductionEnv, env } from "@/lib/env";
import { hashToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";
import { resolveInvitation } from "@/features/invitations/service";
import { publicRsvpLookupSchema, publicRsvpSubmitSchema } from "@/features/invitations/schemas";
import { submitRsvpForGuest } from "@/features/invitations/rsvp-service";
import { formatGuestDisplayName } from "@/features/guests/display-name";

assertProductionEnv();

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

const allowedOrigins = new Set(env.rsvpAllowedOrigins.map(normalizeOrigin));

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) {
    return {
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }

  if (allowedOrigins.has(normalizeOrigin(origin))) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }

  return {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request) {
  const cors = getCorsHeaders(request);
  const url = new URL(request.url);
  const parsed = publicRsvpLookupSchema.safeParse({
    token: url.searchParams.get("token") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invitation token." }, { status: 400, headers: cors });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`public-rsvp:get:${ip}:${hashToken(parsed.data.token)}`, 60, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429, headers: cors });
  }

  const invitation = await resolveInvitation(parsed.data.token);
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404, headers: cors });
  }

  const { guest, wedding } = invitation;
  const guestDisplayName = formatGuestDisplayName(guest);
  const coupleNames = [wedding.partner1Name, wedding.partner2Name].filter(Boolean).join(" & ") || wedding.title;

  return NextResponse.json(
    {
      guest: {
        displayName: guestDisplayName,
        email: guest.email,
        plusOneAllowed: guest.plusOneAllowed,
      },
      wedding: {
        title: wedding.title,
        coupleNames,
      },
      rsvp: {
        invitationStatus: guest.invitationStatus === "NOT_SENT" ? "NOT_SENT" : "SENT",
        rsvpStatus: guest.rsvpStatus,
      },
    },
    { headers: cors },
  );
}

export async function POST(request: Request) {
  const cors = getCorsHeaders(request);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400, headers: cors });
  }

  const parsed = publicRsvpSubmitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your RSVP details and try again." }, { status: 400, headers: cors });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`public-rsvp:post:${ip}:${hashToken(parsed.data.token)}`, 10, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many submissions. Please try again shortly." }, { status: 429, headers: cors });
  }

  const invitation = await resolveInvitation(parsed.data.token);
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404, headers: cors });
  }

  const result = await submitRsvpForGuest({
    weddingId: invitation.wedding.id,
    guestId: invitation.guest.id,
    attending: parsed.data.attending === "yes",
    partySize: parsed.data.guestCount,
    mealPreference: parsed.data.meal,
    message: parsed.data.message,
    guestEmail: parsed.data.email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400, headers: cors });
  }

  return NextResponse.json({ success: true, message: result.message }, { headers: cors });
}
