import Papa from "papaparse";

import { getCurrentWedding } from "@/lib/wedding-context";
import { exportGuests } from "@/features/guests/service";

export async function GET() {
  const { wedding } = await getCurrentWedding();
  const guests = await exportGuests(wedding.id);

  const rows = guests.map((g) => ({
    title: g.title ?? "",
    firstName: g.firstName,
    lastName: g.lastName,
    preferredName: g.preferredName ?? "",
    email: g.email ?? "",
    phone: g.phone ?? "",
    side: g.side,
    relationship: g.relationship ?? "",
    rsvpStatus: g.rsvpStatus,
    invitationStatus: g.invitationStatus,
    mealPreference: g.mealPreference ?? "",
    dietaryRestrictions: g.dietaryRestrictions ?? "",
    plusOneAllowed: g.plusOneAllowed ? "yes" : "no",
    plusOneName: g.plusOneName ?? "",
    notes: g.notes ?? "",
  }));

  const csv = Papa.unparse(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guests-${wedding.id}.csv"`,
    },
  });
}
