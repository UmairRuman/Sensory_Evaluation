"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "./admin-guard";

export type DeletionScope =
  | { kind: "submissions"; submissionIds: string[] }
  | { kind: "panelistVisit"; panelistVisitId: string }
  | { kind: "session"; sessionId: string }
  | { kind: "product"; productId: string };

export interface DeletionPreview {
  submissionCount: number;
  panelistVisitCount: number;
  sampleNames: string[];
  productNames: string[];
  dateRange: { earliest: string | null; latest: string | null };
}

async function resolveSubmissionIds(scope: DeletionScope): Promise<string[]> {
  if (scope.kind === "submissions") return scope.submissionIds;
  if (scope.kind === "panelistVisit") {
    const rows = await prisma.submission.findMany({ where: { panelistVisitId: scope.panelistVisitId }, select: { id: true } });
    return rows.map((r) => r.id);
  }
  if (scope.kind === "session") {
    const rows = await prisma.submission.findMany({
      where: { sample: { sessionProduct: { sessionId: scope.sessionId } } },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
  const rows = await prisma.submission.findMany({
    where: { sample: { sessionProduct: { productId: scope.productId } } },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function previewDeletion(scope: DeletionScope): Promise<{ error: string } | { ok: true; preview: DeletionPreview }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const submissionIds = await resolveSubmissionIds(scope);
  const submissions = await prisma.submission.findMany({
    where: { id: { in: submissionIds } },
    include: { sample: { include: { sessionProduct: { include: { product: true } } } } },
  });

  const dates = submissions.map((s) => s.submittedAt).sort((a, b) => a.getTime() - b.getTime());
  const panelistVisitIds = new Set(submissions.map((s) => s.panelistVisitId));

  if (scope.kind === "panelistVisit") panelistVisitIds.add(scope.panelistVisitId); // count even if it has zero submissions yet

  return {
    ok: true,
    preview: {
      submissionCount: submissions.length,
      panelistVisitCount: panelistVisitIds.size,
      sampleNames: [...new Set(submissions.map((s) => s.sample.sampleName))],
      productNames: [...new Set(submissions.map((s) => s.sample.sessionProduct.product.name))],
      dateRange: { earliest: dates[0]?.toISOString() ?? null, latest: dates[dates.length - 1]?.toISOString() ?? null },
    },
  };
}

export async function deleteEvaluations(scope: DeletionScope, confirmText: string): Promise<{ error: string } | { ok: true; deletedCount: number }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };
  if (confirmText !== "DELETE") return { error: 'Type "DELETE" to confirm — this cannot be undone.' };

  const submissionIds = await resolveSubmissionIds(scope);
  if (submissionIds.length === 0 && scope.kind !== "panelistVisit") {
    return { error: "Nothing matched this selection." };
  }

  await prisma.$transaction(
    async (tx) => {
      // Always remove the raw score data for every targeted submission first (FK-safe order).
      await tx.score.deleteMany({ where: { submissionId: { in: submissionIds } } });
      await tx.submission.deleteMany({ where: { id: { in: submissionIds } } });

      if (scope.kind === "panelistVisit") {
        // Permanently removes the visit itself — this is how an "in-process" (no completed
        // submissions yet) evaluation gets deleted, since it has no Submission row to target.
        await tx.panelistVisit.deleteMany({ where: { id: scope.panelistVisitId } });
      } else if (scope.kind === "session") {
        await tx.panelistVisit.deleteMany({ where: { sessionId: scope.sessionId } });
        await tx.sample.deleteMany({ where: { sessionProduct: { sessionId: scope.sessionId } } });
        await tx.sessionProduct.deleteMany({ where: { sessionId: scope.sessionId } });
        await tx.sessionAttribute.deleteMany({ where: { sessionId: scope.sessionId } });
        await tx.sessionSection.deleteMany({ where: { sessionId: scope.sessionId } });
        await tx.session.delete({ where: { id: scope.sessionId } });
      } else if (scope.kind === "product") {
        // The SKU (Product) itself is never deleted here — only its evaluation data, per the CR.
        const sessionProducts = await tx.sessionProduct.findMany({ where: { productId: scope.productId }, select: { id: true } });
        await tx.sample.deleteMany({ where: { sessionProductId: { in: sessionProducts.map((sp) => sp.id) } } });
        await tx.sessionProduct.deleteMany({ where: { productId: scope.productId } });
      }
      // "submissions" scope deliberately leaves Sample/SessionProduct/PanelistVisit alone —
      // other submissions may still depend on them.
    },
    { timeout: 20000 }
  );

  revalidatePath("/admin/evaluations");
  revalidatePath("/sessions");
  return { ok: true, deletedCount: submissionIds.length };
}

/** CR 4.2b: remove one parameter's score from a single evaluation, leaving the rest intact —
 * a separate, lighter-weight action from deleting the whole evaluation. */
export async function removeScoreFromSubmission(submissionId: string, attributeId: string): Promise<{ error: string } | { ok: true }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  await prisma.score.deleteMany({ where: { submissionId, attributeId } });
  revalidatePath("/admin/evaluations");
  revalidatePath("/sessions");
  return { ok: true };
}
