import { NextResponse } from "next/server";

import { assertProductionEnv } from "@/lib/env";
import { hashToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";
import {
  publicCheckInLookupSchema,
  publicCheckInSubmitSchema,
} from "@/features/check-in/schemas";
import {
  checkInGuestWithSession,
  resolveCheckInSessionToken,
} from "@/features/check-in/service";

assertProductionEnv();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = publicCheckInLookupSchema.safeParse({
    sessionToken: url.searchParams.get("sessionToken") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid check-in session." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(
    `public-checkin:get:${ip}:${hashToken(parsed.data.sessionToken)}`,
    60,
    60_000,
  );
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const session = await resolveCheckInSessionToken(parsed.data.sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Check-in is not available." }, { status: 404 });
  }

  const coupleNames =
    [session.wedding.partner1Name, session.wedding.partner2Name].filter(Boolean).join(" & ") ||
    session.wedding.title;

  return NextResponse.json({
    wedding: {
      title: session.wedding.title,
      coupleNames,
    },
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = publicCheckInSubmitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid check-in request." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(
    `public-checkin:post:${ip}:${hashToken(parsed.data.sessionToken)}`,
    30,
    60_000,
  );
  if (!limited.success) {
    return NextResponse.json({ error: "Too many scans. Please try again shortly." }, { status: 429 });
  }

  const result = await checkInGuestWithSession(parsed.data.sessionToken, parsed.data.guestCode);
  if (!result.ok) {
    const status =
      result.code === "DISABLED" ? 404 : result.code === "NOT_FOUND" || result.code === "INVALID" ? 404 : 400;
    return NextResponse.json({ error: result.error, code: result.code }, { status });
  }

  return NextResponse.json({
    success: true,
    fullName: result.fullName,
    alreadyCheckedIn: result.alreadyCheckedIn,
    checkedInAt: result.checkedInAt,
    plusOneName: result.plusOneName,
    rsvpStatus: result.rsvpStatus,
  });
}
