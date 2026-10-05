"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fetchProductRemarks } from "@/lib/scoring/remarks";
import { generateRemarksSummary, type RemarkSummaryGroup } from "@/lib/ai/remarks-summary";

async function requireHost() {
  const authSession = await auth();
  if (!authSession?.user) throw new Error("Unauthorized");
  return authSession;
}

function groupBySample(remarks: { sampleName: string; text: string }[]): RemarkSummaryGroup[] {
  const bySample = new Map<string, string[]>();
  for (const r of remarks) {
    const list = bySample.get(r.sampleName) ?? [];
    list.push(r.text);
    bySample.set(r.sampleName, list);
  }
  return Array.from(bySample.entries()).map(([label, texts]) => ({ label, remarks: texts }));
}

export async function getProductRemarks(sessionProductId: string) {
  await requireHost();

  const [{ sections, overall, overallHash }, summaries] = await Promise.all([
    fetchProductRemarks(sessionProductId),
    prisma.remarkSummary.findMany({ where: { sessionProductId } }),
  ]);

  const overallSummary = summaries.find((s) => s.sessionSectionId === null) ?? null;
  const summaryBySectionId = new Map(summaries.filter((s) => s.sessionSectionId !== null).map((s) => [s.sessionSectionId, s]));

  return {
    sections: sections.map((s) => ({
      ...s,
      summary: summaryBySectionId.get(s.sessionSectionId) ?? null,
      stale: summaryBySectionId.get(s.sessionSectionId)?.sourceDataHash !== s.sourceDataHash,
    })),
    overall,
    overallSummary,
    overallStale: overallSummary ? overallSummary.sourceDataHash !== overallHash : overall.length > 0,
  };
}

async function upsertSummary(
  sessionProductId: string,
  sessionSectionId: string | null,
  data: { summaryText: string; tone: "POSITIVE" | "MIXED" | "NEGATIVE"; sourceDataHash: string }
) {
  if (sessionSectionId === null) {
    const existing = await prisma.remarkSummary.findFirst({ where: { sessionProductId, sessionSectionId: null } });
    if (existing) {
      return prisma.remarkSummary.update({
        where: { id: existing.id },
        data: { ...data, editedFlag: false, generatedAt: new Date() },
      });
    }
    return prisma.remarkSummary.create({ data: { sessionProductId, sessionSectionId: null, ...data } });
  }
  return prisma.remarkSummary.upsert({
    where: { sessionProductId_sessionSectionId: { sessionProductId, sessionSectionId } },
    create: { sessionProductId, sessionSectionId, ...data },
    update: { ...data, editedFlag: false, generatedAt: new Date() },
  });
}

export async function generateSectionSummary(sessionProductId: string, sessionSectionId: string) {
  await requireHost();

  const { sections } = await fetchProductRemarks(sessionProductId);
  const section = sections.find((s) => s.sessionSectionId === sessionSectionId);
  if (!section) throw new Error("Section not found for this product.");

  const sessionProduct = await prisma.sessionProduct.findUniqueOrThrow({
    where: { id: sessionProductId },
    include: { product: true },
  });

  const result = await generateRemarksSummary({
    scope: `${section.letter}. ${section.name}`,
    productName: sessionProduct.product.name,
    groups: groupBySample(section.remarks),
  });
  if (!result) return { ok: false as const };

  const summary = await upsertSummary(sessionProductId, sessionSectionId, {
    summaryText: result.summaryText,
    tone: result.tone,
    sourceDataHash: section.sourceDataHash,
  });
  return { ok: true as const, summary };
}

export async function generateOverallSummary(sessionProductId: string) {
  await requireHost();

  const { sections, overall, overallHash } = await fetchProductRemarks(sessionProductId);
  const sessionProduct = await prisma.sessionProduct.findUniqueOrThrow({
    where: { id: sessionProductId },
    include: { product: true },
  });

  const groups = groupBySample(
    sections.flatMap((s) => s.remarks.map((r) => ({ sampleName: `${r.sampleName} — ${s.letter}. ${s.name}`, text: r.text })))
  );

  const result = await generateRemarksSummary({
    scope: "Overall",
    productName: sessionProduct.product.name,
    groups,
  });
  if (!result) return { ok: false as const, hasRemarks: overall.length > 0 };

  const summary = await upsertSummary(sessionProductId, null, {
    summaryText: result.summaryText,
    tone: result.tone,
    sourceDataHash: overallHash,
  });
  return { ok: true as const, summary };
}

export async function updateSummaryText(summaryId: string, summaryText: string) {
  await requireHost();
  const trimmed = summaryText.trim();
  if (!trimmed) throw new Error("Summary text cannot be empty.");
  return prisma.remarkSummary.update({
    where: { id: summaryId },
    data: { summaryText: trimmed, editedFlag: true },
  });
}
