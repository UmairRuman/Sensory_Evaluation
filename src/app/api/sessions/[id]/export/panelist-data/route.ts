import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchProductRemarks } from "@/lib/scoring/remarks";
import { isUrduText } from "@/lib/text/urdu";

// Internal data-access export: Panelist Data deliberately includes panelist identity (unlike
// distributed reports), but the Remarks sheet never does — it identifies panelists only by their
// anonymous in-session code, matching the privacy rule applied everywhere else remarks surface.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const dbSession = await prisma.session.findUnique({ where: { id }, select: { name: true } });
  if (!dbSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Ordering and display text come from the session's own locked snapshot (SessionSection /
  // SessionAttribute), not the live masterfile, so an export always matches what panelists
  // actually saw and scored for this session, even if the masterfile changed since.
  const sessionSections = await prisma.sessionSection.findMany({
    where: { sessionId: id, enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  const sectionOrderById = new Map(sessionSections.map((ss, idx) => [ss.sectionId, idx]));
  const sectionLetterById = new Map(sessionSections.map((ss) => [ss.sectionId, ss.letter]));

  const sessionAttributesRaw = await prisma.sessionAttribute.findMany({
    where: { sessionId: id, enabled: true },
    include: { attribute: { select: { sectionId: true } } },
    orderBy: { sortOrder: "asc" },
  });
  const sessionAttributes = [...sessionAttributesRaw].sort(
    (a, b) => (sectionOrderById.get(a.attribute.sectionId) ?? 0) - (sectionOrderById.get(b.attribute.sectionId) ?? 0)
  );

  const submissions = await prisma.submission.findMany({
    where: { excluded: false, sample: { sessionProduct: { sessionId: id } } },
    include: {
      panelistVisit: true,
      sample: { include: { sessionProduct: { include: { product: true } } } },
      scores: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  const workbook = new ExcelJS.Workbook();

  const panelistSheet = workbook.addWorksheet("Panelist Data");
  panelistSheet.addRow([
    "Panelist Name",
    "Age",
    "Gender",
    "Department",
    "Product",
    "Sample Name",
    "Sample Code",
    "Submitted At",
    ...sessionAttributes.map((sa) => `${sectionLetterById.get(sa.attribute.sectionId) ?? "?"}. ${sa.name}`),
    "Comment",
  ]);
  for (const sub of submissions) {
    const scoreByAttr = new Map(sub.scores.map((s) => [s.attributeId, s.value]));
    panelistSheet.addRow([
      sub.panelistVisit.name,
      sub.panelistVisit.age,
      sub.panelistVisit.gender,
      sub.panelistVisit.department,
      sub.sample.sessionProduct.product.name,
      sub.sample.sampleName,
      sub.sample.sampleCode,
      sub.submittedAt.toISOString(),
      ...sessionAttributes.map((sa) => scoreByAttr.get(sa.attributeId) ?? ""),
      sub.comment ?? "",
    ]);
  }
  panelistSheet.columns.forEach((col) => {
    col.width = 16;
  });

  const sessionProducts = await prisma.sessionProduct.findMany({
    where: { sessionId: id },
    include: { product: true },
    orderBy: { sortOrder: "asc" },
  });

  const remarksSheet = workbook.addWorksheet("Remarks");
  remarksSheet.addRow(["Product", "Section", "Panelist Code", "Sample", "Remark"]);

  const summarySheet = workbook.addWorksheet("Remarks Summary");
  summarySheet.addRow(["Product", "Section", "Summary", "Tone", "Edited", "Generated At"]);

  for (const sp of sessionProducts) {
    const { sections } = await fetchProductRemarks(sp.id);

    for (const section of sections) {
      for (const r of section.remarks) {
        const row = remarksSheet.addRow([
          sp.product.name,
          `${section.letter}. ${section.name}`,
          r.anonymousCode,
          r.sampleName,
          r.text,
        ]);
        applyRemarkTextAlignment(row.getCell(5), r.text);
      }
    }

    const summaries = await prisma.remarkSummary.findMany({ where: { sessionProductId: sp.id } });
    const overallSummary = summaries.find((s) => s.sessionSectionId === null);
    if (overallSummary) {
      addSummaryRow(summarySheet, sp.product.name, "Overall", overallSummary);
    }
    for (const section of sections) {
      const sectionSummary = summaries.find((s) => s.sessionSectionId === section.sessionSectionId);
      if (sectionSummary) {
        addSummaryRow(summarySheet, sp.product.name, `${section.letter}. ${section.name}`, sectionSummary);
      }
    }
  }

  remarksSheet.columns = [{ width: 24 }, { width: 22 }, { width: 14 }, { width: 18 }, { width: 60 }];
  summarySheet.columns = [{ width: 24 }, { width: 22 }, { width: 60 }, { width: 12 }, { width: 10 }, { width: 22 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const safeName = dbSession.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeName}-panelist-data.xlsx"`,
    },
  });
}

function applyRemarkTextAlignment(cell: ExcelJS.Cell, text: string) {
  cell.alignment = isUrduText(text)
    ? { horizontal: "right", wrapText: true, readingOrder: "rtl" }
    : { wrapText: true };
}

function addSummaryRow(
  sheet: ExcelJS.Worksheet,
  productName: string,
  sectionLabel: string,
  summary: { summaryText: string; tone: string | null; editedFlag: boolean; generatedAt: Date }
) {
  const row = sheet.addRow([
    productName,
    sectionLabel,
    summary.summaryText,
    summary.tone ?? "",
    summary.editedFlag ? "Yes" : "No",
    summary.generatedAt.toISOString(),
  ]);
  applyRemarkTextAlignment(row.getCell(3), summary.summaryText);
}
