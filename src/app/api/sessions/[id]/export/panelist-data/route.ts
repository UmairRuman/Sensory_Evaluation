import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

// Raw panelist-level export: one row per submission (panelist x sample), one column per scored
// attribute. This is an internal data-access feature, separate from any branded/summary report —
// it deliberately includes panelist identity, unlike distributed reports which omit it.
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

  const sessionAttributes = await prisma.sessionAttribute.findMany({
    where: { sessionId: id, enabled: true },
    include: { attribute: { include: { section: true } } },
    orderBy: [{ attribute: { section: { letter: "asc" } } }, { attribute: { sortOrder: "asc" } }],
  });

  const submissions = await prisma.submission.findMany({
    where: { excluded: false, sample: { sessionProduct: { sessionId: id } } },
    include: {
      panelistVisit: true,
      sample: { include: { sessionProduct: { include: { product: true } } } },
      scores: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  const header = [
    "Panelist Name",
    "Age",
    "Gender",
    "Department",
    "Product",
    "Sample Name",
    "Sample Code",
    "Submitted At",
    ...sessionAttributes.map((sa) => `${sa.attribute.section.letter}. ${sa.attribute.name}`),
    "Comment",
  ];

  const rows = submissions.map((sub) => {
    const scoreByAttr = new Map(sub.scores.map((s) => [s.attributeId, s.value]));
    return [
      sub.panelistVisit.name,
      sub.panelistVisit.age,
      sub.panelistVisit.gender,
      sub.panelistVisit.department,
      sub.sample.sessionProduct.product.name,
      sub.sample.sampleName,
      sub.sample.sampleCode,
      sub.submittedAt.toISOString(),
      ...sessionAttributes.map((sa) => scoreByAttr.get(sa.attributeId) ?? ""),
      sub.comment,
    ];
  });

  const csv = toCsv([header, ...rows]);
  const safeName = dbSession.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}-panelist-data.csv"`,
    },
  });
}
