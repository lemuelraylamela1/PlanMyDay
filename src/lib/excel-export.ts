/**
 * Corporate SpreadsheetML (.xls) workbook builder.
 * Opens cleanly in Excel / Google Sheets with styled headers and zebra rows.
 */

export type ExcelCellValue = string | number | null | undefined;

export type ExcelColumn = {
  key: string;
  header: string;
  /** Approximate character width for AutoFit-like column sizing. */
  width?: number;
  align?: "Left" | "Center" | "Right";
  type?: "String" | "Number";
};

export type ExcelSheet = {
  name: string;
  columns: ExcelColumn[];
  rows: Record<string, ExcelCellValue>[];
};

export type ExcelWorkbookOptions = {
  title?: string;
  generatedAt?: Date;
};

const HEADER_BG = "#1E293B";
const HEADER_FG = "#FFFFFF";
const ALT_ROW_BG = "#F1F5F9";
const BODY_BG = "#FFFFFF";
const BORDER = "#CBD5E1";
const TITLE_BG = "#0F172A";

function escapeXml(value: ExcelCellValue) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function estimateWidth(header: string, rows: Record<string, ExcelCellValue>[], key: string) {
  let max = header.length;
  for (const row of rows.slice(0, 200)) {
    const length = String(row[key] ?? "").length;
    if (length > max) max = length;
  }
  // SpreadsheetML width is roughly in characters; clamp for readability.
  return Math.min(48, Math.max(12, max + 2));
}

function cellXml(
  value: ExcelCellValue,
  styleId: string,
  type: "String" | "Number" = "String",
) {
  const resolvedType =
    type === "Number" && value !== "" && value != null && !Number.isNaN(Number(value))
      ? "Number"
      : "String";
  const data =
    resolvedType === "Number" ? String(Number(value)) : escapeXml(value);
  return `<Cell ss:StyleID="${styleId}"><Data ss:Type="${resolvedType}">${data}</Data></Cell>`;
}

function stylesXml() {
  return `<Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
      <Interior ss:Color="${BODY_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Title">
      <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="${HEADER_FG}"/>
      <Interior ss:Color="${TITLE_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Subtitle">
      <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#E2E8F0"/>
      <Interior ss:Color="${TITLE_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Vertical="Center" ss:Horizontal="Left" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="${HEADER_FG}"/>
      <Interior ss:Color="${HEADER_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="HeaderCenter">
      <Alignment ss:Vertical="Center" ss:Horizontal="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="${HEADER_FG}"/>
      <Interior ss:Color="${HEADER_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Body">
      <Alignment ss:Vertical="Center" ss:Horizontal="Left" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
      <Interior ss:Color="${BODY_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="BodyAlt">
      <Alignment ss:Vertical="Center" ss:Horizontal="Left" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
      <Interior ss:Color="${ALT_ROW_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="BodyCenter">
      <Alignment ss:Vertical="Center" ss:Horizontal="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
      <Interior ss:Color="${BODY_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="BodyAltCenter">
      <Alignment ss:Vertical="Center" ss:Horizontal="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
      <Interior ss:Color="${ALT_ROW_BG}" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Money">
      <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
      <Interior ss:Color="${BODY_BG}" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
    <Style ss:ID="MoneyAlt">
      <Alignment ss:Vertical="Center" ss:Horizontal="Right"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="${BORDER}"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
      <Interior ss:Color="${ALT_ROW_BG}" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
  </Styles>`;
}

function sheetXml(sheet: ExcelSheet, options?: ExcelWorkbookOptions) {
  const colCount = sheet.columns.length;
  const title = options?.title ?? sheet.name;
  const generated = (options?.generatedAt ?? new Date()).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const columns = sheet.columns
    .map((column) => {
      const width =
        column.width ?? estimateWidth(column.header, sheet.rows, column.key);
      return `<Column ss:AutoFitWidth="0" ss:Width="${width * 6}"/>`;
    })
    .join("");

  const headerCells = sheet.columns
    .map((column) =>
      cellXml(
        column.header,
        column.align === "Center" ? "HeaderCenter" : "Header",
      ),
    )
    .join("");

  const bodyRows = sheet.rows
    .map((row, index) => {
      const alt = index % 2 === 1;
      const cells = sheet.columns
        .map((column) => {
          const centered = column.align === "Center";
          let styleId = alt ? "BodyAlt" : "Body";
          if (column.type === "Number") styleId = alt ? "MoneyAlt" : "Money";
          else if (centered) styleId = alt ? "BodyAltCenter" : "BodyCenter";
          return cellXml(row[column.key], styleId, column.type ?? "String");
        })
        .join("");
      return `<Row ss:AutoFitHeight="0" ss:Height="22">${cells}</Row>`;
    })
    .join("");

  return `<Worksheet ss:Name="${escapeXml(sheet.name).slice(0, 31)}">
    <Table ss:ExpandedColumnCount="${colCount}" ss:ExpandedRowCount="${sheet.rows.length + 3}" x:FullColumns="1" x:FullRows="1">
      ${columns}
      <Row ss:AutoFitHeight="0" ss:Height="28">
        <Cell ss:StyleID="Title" ss:MergeAcross="${Math.max(0, colCount - 1)}"><Data ss:Type="String">${escapeXml(title)}</Data></Cell>
      </Row>
      <Row ss:AutoFitHeight="0" ss:Height="20">
        <Cell ss:StyleID="Subtitle" ss:MergeAcross="${Math.max(0, colCount - 1)}"><Data ss:Type="String">${escapeXml(`Generated ${generated} · ${sheet.rows.length} row(s)`)}</Data></Cell>
      </Row>
      <Row ss:AutoFitHeight="0" ss:Height="24">${headerCells}</Row>
      ${bodyRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>3</SplitHorizontal>
      <TopRowBottomPane>3</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
  </Worksheet>`;
}

/** Build a styled SpreadsheetML workbook string. */
export function buildExcelWorkbook(
  sheets: ExcelSheet[],
  options?: ExcelWorkbookOptions,
) {
  const worksheets = sheets.map((sheet) => sheetXml(sheet, options)).join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  ${stylesXml()}
  ${worksheets}
</Workbook>`;
}

export function excelResponse(workbookXml: string, filename: string) {
  const safeName = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  return new Response(workbookXml, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Browser-side download helper for client exports. */
export function downloadExcelWorkbook(
  sheets: ExcelSheet[],
  filename: string,
  options?: ExcelWorkbookOptions,
) {
  const workbook = buildExcelWorkbook(sheets, options);
  const blob = new Blob([workbook], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
