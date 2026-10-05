import { prisma } from "@/lib/prisma";
import { listCategories } from "@/lib/masterfile/queries";
import { EvaluationRecordsClient } from "@/components/admin/evaluation-records-client";
import type { Prisma } from "@prisma/client";

export default async function EvaluationRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; productId?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const categories = await listCategories();
  const products = await prisma.product.findMany({
    where: params.categoryId ? { categoryId: params.categoryId } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true, categoryId: true },
  });

  const sessionProductFilter: Prisma.SessionProductWhereInput = {};
  if (params.categoryId) sessionProductFilter.session = { categoryId: params.categoryId };
  if (params.productId) sessionProductFilter.productId = params.productId;

  const submissionWhere: Prisma.SubmissionWhereInput = { excluded: false };
  if (params.categoryId || params.productId) submissionWhere.sample = { sessionProduct: sessionProductFilter };
  if (params.from || params.to) {
    submissionWhere.submittedAt = {
      gte: params.from ? new Date(params.from) : undefined,
      lte: params.to ? new Date(`${params.to}T23:59:59`) : undefined,
    };
  }

  const submissions = await prisma.submission.findMany({
    where: submissionWhere,
    orderBy: { submittedAt: "desc" },
    take: 300,
    include: {
      panelistVisit: true,
      sample: { include: { sessionProduct: { include: { product: true, session: { include: { category: true } } } } } },
    },
  });

  // In-process: panelist visits that joined a (possibly filtered) session but haven't submitted
  // every sample yet. The CR assumes draft/autosave persistence already exists; our app doesn't
  // have one, so "in-process" here means exactly this — a joined-but-incomplete visit.
  const visitWhere: Prisma.PanelistVisitWhereInput = {};
  if (params.categoryId) visitWhere.session = { categoryId: params.categoryId };
  const visits = await prisma.panelistVisit.findMany({
    where: visitWhere,
    include: {
      session: { include: { category: true, sessionProducts: { include: { samples: true } } } },
      submissions: true,
    },
    take: 300,
  });
  const inProcessVisits = visits
    .filter((v) => {
      const totalSamples = v.session.sessionProducts.reduce((n, sp) => n + sp.samples.length, 0);
      return v.submissions.length < totalSamples;
    })
    .map((v) => ({
      id: v.id,
      panelistName: v.name,
      categoryTitle: v.session.category.title,
      sessionId: v.session.id,
      sessionName: v.session.name,
      joinedAt: v.joinedAt.toISOString(),
      submittedCount: v.submissions.length,
      totalSamples: v.session.sessionProducts.reduce((n, sp) => n + sp.samples.length, 0),
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.16em] text-brand-accent">Admin</p>
      <h1 className="mt-1 mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-primary-strong">
        Evaluation Records
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        Permanently delete test or trial evaluations. Deletion removes the record, its scores, and any
        remarks from the database — this cannot be undone.
      </p>
      <EvaluationRecordsClient
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
        products={products}
        filters={{ categoryId: params.categoryId ?? "", productId: params.productId ?? "", from: params.from ?? "", to: params.to ?? "" }}
        submissions={submissions.map((s) => ({
          id: s.id,
          panelistName: s.panelistVisit.name,
          categoryTitle: s.sample.sessionProduct.session.category.title,
          productName: s.sample.sessionProduct.product.name,
          sessionId: s.sample.sessionProduct.sessionId,
          sessionName: s.sample.sessionProduct.session.name,
          sampleName: s.sample.sampleName,
          submittedAt: s.submittedAt.toISOString(),
        }))}
        inProcessVisits={inProcessVisits}
      />
    </div>
  );
}
