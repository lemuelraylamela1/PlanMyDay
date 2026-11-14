import {
  downloadExcelWorkbook,
  type ExcelColumn,
  type ExcelSheet,
} from "@/lib/excel-export";

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

const supplierColumns: ExcelColumn[] = [
  { key: "company", header: "Supplier", width: 28 },
  { key: "category", header: "Category", width: 18 },
  { key: "contact", header: "Contact", width: 18 },
  { key: "phone", header: "Phone", width: 16 },
  { key: "email", header: "Email", width: 28 },
  { key: "status", header: "Status", width: 14, align: "Center" },
  { key: "paymentStatus", header: "Payment status", width: 16, align: "Center" },
  { key: "contract", header: "Contract", width: 14, type: "Number", align: "Right" },
  { key: "paid", header: "Paid", width: 14, type: "Number", align: "Right" },
  { key: "balance", header: "Balance", width: 14, type: "Number", align: "Right" },
  { key: "dueDate", header: "Due date", width: 14, align: "Center" },
];

const paymentColumns: ExcelColumn[] = [
  { key: "company", header: "Supplier", width: 28 },
  { key: "paymentDate", header: "Payment date", width: 16, align: "Center" },
  { key: "amount", header: "Amount", width: 14, type: "Number", align: "Right" },
  { key: "notes", header: "Notes", width: 36 },
];

export function exportSuppliersToExcel(rows: SupplierExportRow[], currency: string) {
  const supplierSheet: ExcelSheet = {
    name: "Suppliers",
    columns: supplierColumns,
    rows: rows.map((supplier) => ({
      company: supplier.company,
      category: supplier.categoryName ?? "",
      contact: supplier.contactPerson ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      status: supplier.status,
      paymentStatus: supplier.paymentStatus,
      contract: supplier.contractAmount,
      paid: supplier.downPayment,
      balance: Math.max(0, supplier.contractAmount - supplier.downPayment),
      dueDate: shortDate(supplier.dueDate),
    })),
  };

  const paymentSheet: ExcelSheet = {
    name: "Payments",
    columns: paymentColumns,
    rows: rows.flatMap((supplier) =>
      supplier.payments.map((payment) => ({
        company: supplier.company,
        paymentDate: shortDate(payment.paymentDate),
        amount: payment.amount,
        notes: payment.notes ?? "",
      })),
    ),
  };

  downloadExcelWorkbook(
    [supplierSheet, paymentSheet],
    `supplier-report-${fileDate()}.xls`,
    { title: `Supplier Financial Report (${currency})` },
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
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [241, 245, 249] },
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
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });
  }

  document.save(`supplier-report-${fileDate()}.pdf`);
}
