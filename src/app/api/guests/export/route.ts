import { getCurrentWedding } from "@/lib/wedding-context";
import {
  buildExcelWorkbook,
  excelResponse,
  type ExcelColumn,
} from "@/lib/excel-export";
import { exportGuests } from "@/features/guests/service";

const columns: ExcelColumn[] = [
  { key: "title", header: "Title", width: 10, align: "Center" },
  { key: "firstName", header: "First name", width: 16 },
  { key: "lastName", header: "Last name", width: 16 },
  { key: "preferredName", header: "Preferred name", width: 16 },
  { key: "email", header: "Email", width: 28 },
  { key: "phone", header: "Phone", width: 16 },
  { key: "facebookLink", header: "Facebook link", width: 36 },
  { key: "side", header: "Side", width: 12, align: "Center" },
  { key: "relationship", header: "Relationship", width: 18 },
  { key: "rsvpStatus", header: "RSVP status", width: 14, align: "Center" },
  { key: "invitationStatus", header: "Invitation", width: 14, align: "Center" },
  { key: "mealPreference", header: "Meal preference", width: 16 },
  { key: "dietaryRestrictions", header: "Dietary restrictions", width: 22 },
  { key: "plusOneAllowed", header: "Plus one", width: 12, align: "Center" },
  { key: "plusOneName", header: "Plus one name", width: 18 },
  { key: "notes", header: "Notes", width: 28 },
];

export async function GET() {
  const { wedding } = await getCurrentWedding();
  const guests = await exportGuests(wedding.id);

  const rows = guests.map((guest) => ({
    title: guest.title ?? "",
    firstName: guest.firstName,
    lastName: guest.lastName,
    preferredName: guest.preferredName ?? "",
    email: guest.email ?? "",
    phone: guest.phone ?? "",
    facebookLink: guest.facebookLink ?? "",
    side: guest.side,
    relationship: guest.relationship ?? "",
    rsvpStatus: guest.rsvpStatus,
    invitationStatus: guest.invitationStatus,
    mealPreference: guest.mealPreference ?? "",
    dietaryRestrictions: guest.dietaryRestrictions ?? "",
    plusOneAllowed: guest.plusOneAllowed ? "Yes" : "No",
    plusOneName: guest.plusOneName ?? "",
    notes: guest.notes ?? "",
  }));

  const workbook = buildExcelWorkbook(
    [{ name: "Guests", columns, rows }],
    { title: `${wedding.title || "Wedding"} — Guest List` },
  );

  return excelResponse(workbook, `guests-${wedding.id}.xls`);
}
