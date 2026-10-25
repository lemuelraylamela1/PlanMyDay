import {
  guestStatusLabel,
  occupiedSeats,
  shapeLabel,
  sideLabel,
  type SeatGuest,
  type SeatingTableData,
} from "@/features/seating/model";

interface SeatingChartInput {
  weddingTitle: string;
  tables: SeatingTableData[];
  unassigned: SeatGuest[];
}

function fileSlug(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "seating-chart";
}

function guestCell(guest: SeatGuest) {
  const status = guestStatusLabel(guest);
  return status ? `${guest.name} (${status})` : guest.name;
}

function guestRow(tableLabel: string, guest: SeatGuest) {
  return [
    tableLabel,
    guestCell(guest),
    sideLabel(guest.side),
    guest.groupName ?? "",
    guest.mealPreference ?? "",
    guest.dietaryRestrictions ?? "",
    guest.plusOneName ?? "",
  ];
}

function tableLabel(table: SeatingTableData) {
  return `${table.name} · ${shapeLabel(table.shape)} · ${occupiedSeats(table.guests)}/${table.capacity}`;
}

export async function exportSeatingChartPdf({
  weddingTitle,
  tables,
  unassigned,
}: SeatingChartInput) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const document = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const seatedHeads = tables.reduce((total, table) => total + occupiedSeats(table.guests), 0);
  const totalSeats = tables.reduce((total, table) => total + table.capacity, 0);
  const generated = new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());

  document.setFontSize(18);
  const heading = document.splitTextToSize(`${weddingTitle} seating chart`, 760);
  const headingLines = Array.isArray(heading) ? heading : [heading];
  document.text(headingLines, 40, 42);
  const afterHeading = 42 + headingLines.length * 22;

  document.setFontSize(10);
  document.setTextColor(90);
  document.text(
    `${tables.length} tables · ${seatedHeads} seated · ${Math.max(totalSeats - seatedHeads, 0)} open · ${unassigned.length} unassigned · ${generated}`,
    40,
    afterHeading,
  );
  document.text("A named plus one takes a seat beside their host.", 40, afterHeading + 16);
  document.setTextColor(20);

  const tableRows = tables.flatMap((table) => {
    const label = tableLabel(table);
    if (table.guests.length === 0) return [[label, "No guests yet", "", "", "", "", ""]];
    return table.guests.map((guest) => guestRow(label, guest));
  });
  const unassignedRows = unassigned.map((guest) => guestRow("Unassigned", guest));
  const body = [...tableRows, ...unassignedRows];

  autoTable(document, {
    startY: afterHeading + 32,
    head: [["Table", "Guest", "Side", "Group", "Meal", "Dietary", "Plus one"]],
    body: body.length > 0 ? body : [["—", "No guests to seat", "", "", "", "", ""]],
    styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [55, 65, 81] },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 140 },
    },
  });

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setFontSize(8);
    document.setTextColor(120);
    document.text(
      `${page} / ${pageCount}`,
      document.internal.pageSize.getWidth() - 56,
      document.internal.pageSize.getHeight() - 24,
    );
  }

  document.save(
    `seating-chart-${fileSlug(weddingTitle)}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
