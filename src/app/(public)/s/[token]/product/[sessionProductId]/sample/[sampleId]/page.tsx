import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { flattenSamples, nextSample } from "@/lib/session/flow";
import { ClosedNotice } from "@/components/panelist/closed-notice";
import { ScoringForm } from "@/components/panelist/scoring-form";

export default async function ScoringPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; sessionProductId: string; sampleId: string }>;
  searchParams: Promise<{ pv?: string }>;
}) {
  const { token, sessionProductId, sampleId } = await params;
  const { pv } = await searchParams;

  if (!pv) {
    redirect(`/s/${token}`);
  }

  const session = await prisma.session.findUnique({
    where: { publicToken: token },
    include: {
      sessionProducts: {
        orderBy: { sortOrder: "asc" },
        include: { product: true, samples: { orderBy: { sortOrder: "asc" } } },
      },
      sessionSections: {
        where: { enabled: true },
        orderBy: { sortOrder: "asc" },
      },
      sessionAttributes: {
        where: { enabled: true },
        orderBy: { sortOrder: "asc" },
        include: { attribute: { select: { sectionId: true, kind: true } } }, // structural keys only — all display text below is the frozen snapshot
      },
    },
  });

  if (!session) {
    return <ClosedNotice title="Link not found" message="This scoring link isn't valid." />;
  }
  if (session.status !== "ACTIVE") {
    return <ClosedNotice title="Session closed" message="This session is no longer accepting submissions." />;
  }

  const visit = await prisma.panelistVisit.findUnique({ where: { id: pv } });
  if (!visit || visit.sessionId !== session.id) {
    redirect(`/s/${token}`);
  }

  const sessionProduct = session.sessionProducts.find((sp) => sp.id === sessionProductId);
  const sample = sessionProduct?.samples.find((s) => s.id === sampleId);
  if (!sessionProduct || !sample) {
    return <ClosedNotice title="Sample not found" message="This sample isn't part of the session." />;
  }

  const flat = flattenSamples(session.sessionProducts);
  const upcoming = nextSample(flat, sampleId);
  const nextHref = upcoming
    ? `/s/${token}/product/${upcoming.sessionProductId}/sample/${upcoming.sampleId}?pv=${pv}`
    : `/s/${token}/done`;

  const existingSubmission = await prisma.submission.findUnique({
    where: { panelistVisitId_sampleId: { panelistVisitId: pv, sampleId } },
  });
  if (existingSubmission) {
    redirect(nextHref);
  }

  // Built entirely from the session's own locked snapshot (SessionSection/SessionAttribute), never
  // from the live Section/Attribute masterfile — so a panelist resuming an in-process evaluation,
  // or scoring any sample after the host later edits the masterfile, always sees the exact form
  // that was locked in at publish time.
  const attributesBySection = new Map<string, typeof session.sessionAttributes>();
  for (const sa of session.sessionAttributes) {
    const list = attributesBySection.get(sa.attribute.sectionId) ?? [];
    list.push(sa);
    attributesBySection.set(sa.attribute.sectionId, list);
  }
  const sections = session.sessionSections.map((ss) => ({
    id: ss.sectionId,
    sessionSectionId: ss.id, // the FK remarks attach to — distinct from the live Section id above
    letter: ss.letter,
    name: ss.name,
    attributes: (attributesBySection.get(ss.sectionId) ?? []).map((sa) => ({
      id: sa.attributeId,
      name: sa.name,
      kind: sa.attribute.kind,
      lowLabel: sa.lowLabel,
      midLabel: sa.midLabel,
      highLabel: sa.highLabel,
    })),
  }));

  const progress = flat.findIndex((f) => f.sampleId === sampleId) + 1;

  return (
    <ScoringForm
      token={token}
      panelistVisitId={pv}
      sampleId={sampleId}
      sampleName={sample.sampleName}
      productName={sessionProduct.product.name}
      sections={sections}
      progress={{ current: progress, total: flat.length }}
      nextHref={nextHref}
    />
  );
}
