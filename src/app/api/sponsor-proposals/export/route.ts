import { getCurrentWedding } from "@/lib/wedding-context";
import {
  buildExcelWorkbook,
  excelResponse,
  type ExcelColumn,
} from "@/lib/excel-export";
import { entourageRoleLabels } from "@/features/sponsor-proposals/schemas";
import { exportSponsorProposals } from "@/features/sponsor-proposals/service";

const columns: ExcelColumn[] = [
  { key: "name", header: "Name", width: 28 },
  { key: "role", header: "Role", width: 20 },
  { key: "roleCode", header: "Role code", width: 20 },
  { key: "email", header: "Email", width: 28 },
  { key: "phone", header: "Phone", width: 16 },
  { key: "facebookLink", header: "Facebook link", width: 36 },
  { key: "customMessage", header: "Proposal message", width: 42 },
  { key: "status", header: "Status", width: 12, align: "Center" },
  { key: "openedAt", header: "Opened at", width: 20 },
  { key: "respondedAt", header: "Responded at", width: 20 },
  { key: "responseMessage", header: "Response message", width: 28 },
];

function formatStamp(value: Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export async function GET() {
  const { wedding } = await getCurrentWedding();
  const proposals = await exportSponsorProposals(wedding.id);

  const rows = proposals.map((proposal) => ({
    name: proposal.name,
    role: entourageRoleLabels[proposal.role],
    roleCode: proposal.role,
    email: proposal.email ?? "",
    phone: proposal.phone ?? "",
    facebookLink: proposal.facebookLink ?? "",
    customMessage: proposal.customMessage,
    status: proposal.status,
    openedAt: formatStamp(proposal.openedAt),
    respondedAt: formatStamp(proposal.respondedAt),
    responseMessage: proposal.responseMessage ?? "",
  }));

  const workbook = buildExcelWorkbook(
    [{ name: "Entourage", columns, rows }],
    { title: `${wedding.title || "Wedding"} — Entourage` },
  );

  return excelResponse(workbook, `entourage-${wedding.id}.xls`);
}
