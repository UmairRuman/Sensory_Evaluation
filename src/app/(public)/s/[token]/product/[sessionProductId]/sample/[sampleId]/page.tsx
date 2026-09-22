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
        include: {
          section: {
            include: {
              attributes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      sessionAttributes: {
        where: { enabled: true },
        include: { attribute: true },
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

  const enabledAttributeIds = new Set(session.sessionAttributes.map((sa) => sa.attributeId));
  const sections = session.sessionSections.map((ss) => ({
    id: ss.section.id,
    letter: ss.section.letter,
    name: ss.section.name,
    attributes: ss.section.attributes
      .filter((a) => enabledAttributeIds.has(a.id))
      .map((a) => ({ id: a.id, name: a.name, kind: a.kind, lowLabel: a.lowLabel, midLabel: a.midLabel, highLabel: a.highLabel })),
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
