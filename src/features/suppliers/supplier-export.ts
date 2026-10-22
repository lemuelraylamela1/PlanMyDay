export interface SupplierExportPayment {
  amount: number;
  paymentDate: string;
  notes: string | null;
}

export interface SupplierExportRow {
  company: string;
  categoryName: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  contractAmount: number;
  downPayment: number;
  dueDate: string | null;
  status: string;
  paymentStatus: string;
  payments: SupplierExportPayment[];
}

function fileDate() {
  return new Date().toISOString().slice(0, 10);
}

function money(amount: number, currency: string) {
  return `${currency} ${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function shortDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function xml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cell(value: string | number, type: "String" | "Number" = "String", style = "") {
  const styleAttribute = style ? ` ss:StyleID="${style}"` : "";
  return `<Cell${styleAttribute}><Data ss:Type="${type}">${xml(value)}</Data></Cell>`;
}

export function exportSuppliersToExcel(rows: SupplierExportRow[], currency: string) {
  const supplierRows = rows
    .map((supplier) => {
      const balance = Math.max(0, supplier.contractAmount - supplier.downPayment);
      return `<Row>
        ${cell(supplier.company)}
        ${cell(supplier.categoryName ?? "")}
        ${cell(supplier.contactPerson ?? "")}
        ${cell(supplier.phone ?? "")}
        ${cell(supplier.email ?? "")}
        ${cell(supplier.status)}
        ${cell(supplier.paymentStatus)}
        ${cell(supplier.contractAmount, "Number", "Money")}
        ${cell(supplier.downPayment, "Number", "Money")}
        ${cell(balance, "Number", "Money")}
        ${cell(shortDate(supplier.dueDate))}
      </Row>`;
    })
    .join("");

  const paymentRows = rows
    .flatMap((supplier) =>
      supplier.payments.map(
        (payment) => `<Row>
          ${cell(supplier.company)}
          ${cell(shortDate(payment.paymentDate))}
          ${cell(payment.amount, "Number", "Money")}
          ${cell(payment.notes ?? "")}
        </Row>`,
      ),
    )
    .join("");

  const workbook = `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Styles>
      <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>
      <Style ss:ID="Money"><NumberFormat ss:Format="&quot;${xml(currency)}&quot; #,##0.00"/></Style>
    </Styles>
    <Worksheet ss:Name="Suppliers">
      <Table>
        <Row>
          ${["Supplier", "Category", "Contact", "Phone", "Email", "Status", "Payment status", "Contract", "Paid", "Balance", "Due date"].map((heading) => cell(heading, "String", "Header")).join("")}
        </Row>
        ${supplierRows}
      </Table>
    </Worksheet>
    <Worksheet ss:Name="Payments">
      <Table>
        <Row>
          ${["Supplier", "Payment date", "Amount", "Notes"].map((heading) => cell(heading, "String", "Header")).join("")}
        </Row>
        ${paymentRows}
      </Table>
    </Worksheet>
  </Workbook>`;

  downloadBlob(
    new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" }),
    `supplier-report-${fileDate()}.xls`,
  );
}

export async function exportSuppliersToPdf(rows: SupplierExportRow[], currency: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const document = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const active = rows.filter((supplier) => supplier.status !== "CANCELLED");
  const contracted = active.reduce((total, supplier) => total + supplier.contractAmount, 0);
  const paid = active.reduce((total, supplier) => total + supplier.downPayment, 0);

  document.setFontSize(18);
  document.text("Supplier Financial Report", 40, 42);
  document.setFontSize(9);
  document.setTextColor(100);
  document.text(`Generated ${shortDate(new Date().toISOString())} · ${rows.length} suppliers`, 40, 60);
  document.setTextColor(0);
  document.setFontSize(11);
  document.text(`Contracted: ${money(contracted, currency)}`, 40, 84);
  document.text(`Paid: ${money(paid, currency)}`, 250, 84);
  document.text(`Remaining: ${money(Math.max(0, contracted - paid), currency)}`, 430, 84);

  autoTable(document, {
    startY: 102,
    head: [["Supplier", "Category", "Status", "Payment", "Contract", "Paid", "Balance", "Due date"]],
    body: rows.map((supplier) => [
      supplier.company,
      supplier.categoryName ?? "Uncategorized",
      supplier.status,
      supplier.paymentStatus,
      money(supplier.contractAmount, currency),
      money(supplier.downPayment, currency),
      money(Math.max(0, supplier.contractAmount - supplier.downPayment), currency),
      shortDate(supplier.dueDate) || "—",
    ]),
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [55, 65, 81] },
  });

  const payments = rows.flatMap((supplier) =>
    supplier.payments.map((payment) => [
      supplier.company,
      shortDate(payment.paymentDate),
      money(payment.amount, currency),
      payment.notes ?? "",
    ]),
  );
  if (payments.length > 0) {
    document.addPage();
    document.setFontSize(16);
    document.text("Payment History", 40, 42);
    autoTable(document, {
      startY: 58,
      head: [["Supplier", "Payment date", "Amount", "Notes"]],
      body: payments,
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: [55, 65, 81] },
    });
  }

  document.save(`supplier-report-${fileDate()}.pdf`);
}
