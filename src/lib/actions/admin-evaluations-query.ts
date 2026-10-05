"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "./admin-guard";

export async function fetchSubmissionScores(
  submissionId: string
): Promise<{ error: string } | { ok: true; scores: { attributeId: string; name: string; value: number }[] }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const scores = await prisma.score.findMany({
    where: { submissionId },
    include: { attribute: { select: { name: true } } },
    orderBy: { attribute: { sortOrder: "asc" } },
  });

  return { ok: true, scores: scores.map((s) => ({ attributeId: s.attributeId, name: s.attribute.name, value: s.value })) };
}
