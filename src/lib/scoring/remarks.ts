import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export interface RemarkEntry {
  anonymousCode: string; // e.g. "P3" — derived from join order, never the panelist's real name
  sampleId: string;
  sampleName: string;
  sampleCode: string;
  text: string;
}

export interface SectionRemarks {
  sessionSectionId: string;
  sectionId: string; // structural key, matches SectionTargetScore.sectionId from aggregate.ts
  letter: string;
  name: string;
  remarks: RemarkEntry[];
  sourceDataHash: string;
}

export interface ProductRemarks {
  sections: SectionRemarks[];
  overall: RemarkEntry[];
  overallHash: string;
}

function hashRemarks(rows: { id: string; text: string }[]): string {
  const input = rows
    .map((r) => `${r.id}:${r.text}`)
    .sort()
    .join("|");
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function fetchProductRemarks(sessionProductId: string): Promise<ProductRemarks> {
  const sessionProduct = await prisma.sessionProduct.findUniqueOrThrow({
    where: { id: sessionProductId },
    include: { samples: true },
  });

  const sessionSections = await prisma.sessionSection.findMany({
    where: { sessionId: sessionProduct.sessionId, enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  const sampleIds = sessionProduct.samples.map((s) => s.id);
  const sampleById = new Map(sessionProduct.samples.map((s) => [s.id, s]));

  const remarkRows = await prisma.remark.findMany({
    where: { submission: { sampleId: { in: sampleIds }, excluded: false } },
    include: { submission: { select: { sampleId: true, panelistVisitId: true } } },
    orderBy: { createdAt: "asc" },
  });

  const visits = await prisma.panelistVisit.findMany({
    where: { sessionId: sessionProduct.sessionId },
    orderBy: { joinedAt: "asc" },
    select: { id: true },
  });
  const codeByVisitId = new Map(visits.map((v, idx) => [v.id, `P${idx + 1}`]));

  const sections: SectionRemarks[] = sessionSections.map((ss) => {
    const rows = remarkRows.filter((r) => r.sessionSectionId === ss.id);
    const remarks: RemarkEntry[] = rows.map((r) => {
      const sample = sampleById.get(r.submission.sampleId)!;
      return {
        anonymousCode: codeByVisitId.get(r.submission.panelistVisitId) ?? "P?",
        sampleId: sample.id,
        sampleName: sample.sampleName,
        sampleCode: sample.sampleCode,
        text: r.text,
      };
    });
    return {
      sessionSectionId: ss.id,
      sectionId: ss.sectionId,
      letter: ss.letter,
      name: ss.name,
      remarks,
      sourceDataHash: hashRemarks(rows),
    };
  });

  const overall = sections.flatMap((s) => s.remarks);
  const overallHash = hashRemarks(remarkRows);

  return { sections, overall, overallHash };
}
