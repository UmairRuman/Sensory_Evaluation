import { prisma } from "@/lib/prisma";

export interface AttributeAverage {
  attributeId: string;
  name: string;
  average: number | null;
  count: number;
}

export interface SectionAverage {
  sectionId: string;
  letter: string;
  name: string;
  average: number | null;
  attributes: AttributeAverage[];
}

export interface SampleAggregate {
  sampleId: string;
  sampleName: string;
  sampleCode: string;
  sections: SectionAverage[];
  averageAttributeScore: number | null;
  overallLiking: number | null;
  composite: number | null;
  deviation: number | null;
  rank: number | null;
  submissionCount: number;
}

export interface ProductAggregate {
  sessionProductId: string;
  productId: string;
  productName: string;
  samples: SampleAggregate[];
}

export interface SessionAggregate {
  sessionId: string;
  totalPanelists: number;
  totalSubmissions: number;
  products: ProductAggregate[];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function computeSessionAggregate(sessionId: string): Promise<SessionAggregate> {
  const session = await prisma.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      sessionProducts: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: true,
          samples: { orderBy: { sortOrder: "asc" } },
        },
      },
      sessionSections: {
        where: { enabled: true },
        orderBy: { sortOrder: "asc" },
        include: { section: true },
      },
      sessionAttributes: {
        where: { enabled: true },
        orderBy: { sortOrder: "asc" },
        include: { attribute: true },
      },
    },
  });

  const enabledAttributeIds = new Set(session.sessionAttributes.map((sa) => sa.attributeId));
  const attributesBySection = new Map<string, typeof session.sessionAttributes>();
  for (const sa of session.sessionAttributes) {
    const list = attributesBySection.get(sa.attribute.sectionId) ?? [];
    list.push(sa);
    attributesBySection.set(sa.attribute.sectionId, list);
  }

  const scores = await prisma.score.findMany({
    where: {
      attributeId: { in: Array.from(enabledAttributeIds) },
      submission: { excluded: false, sample: { sessionProduct: { sessionId } } },
    },
    select: {
      value: true,
      attributeId: true,
      submission: { select: { sampleId: true } },
    },
  });

  // sampleId -> attributeId -> values[]
  const valuesBySample = new Map<string, Map<string, number[]>>();
  for (const score of scores) {
    const sampleId = score.submission.sampleId;
    if (!valuesBySample.has(sampleId)) valuesBySample.set(sampleId, new Map());
    const attrMap = valuesBySample.get(sampleId)!;
    if (!attrMap.has(score.attributeId)) attrMap.set(score.attributeId, []);
    attrMap.get(score.attributeId)!.push(score.value);
  }

  const submissionCounts = await prisma.submission.groupBy({
    by: ["sampleId"],
    where: { excluded: false, sample: { sessionProduct: { sessionId } } },
    _count: { _all: true },
  });
  const submissionCountBySample = new Map(submissionCounts.map((s) => [s.sampleId, s._count._all]));

  const products: ProductAggregate[] = session.sessionProducts.map((sp) => {
    const samples: SampleAggregate[] = sp.samples.map((sample) => {
      const attrValues = valuesBySample.get(sample.id) ?? new Map<string, number[]>();

      const sections: SectionAverage[] = session.sessionSections.map((ss) => {
        const attrs = (attributesBySection.get(ss.sectionId) ?? []).filter(
          (sa) => sa.attribute.kind !== "OVERALL_HEDONIC"
        );
        const attributeAverages: AttributeAverage[] = attrs.map((sa) => {
          const values = attrValues.get(sa.attributeId) ?? [];
          return { attributeId: sa.attributeId, name: sa.attribute.name, average: mean(values), count: values.length };
        });
        const sectionMeans = attributeAverages.map((a) => a.average).filter((v): v is number => v !== null);
        return {
          sectionId: ss.sectionId,
          letter: ss.section.letter,
          name: ss.section.name,
          average: mean(sectionMeans),
          attributes: attributeAverages,
        };
      });

      const allStandardMeans = sections.flatMap((s) => s.attributes.map((a) => a.average)).filter((v): v is number => v !== null);
      const averageAttributeScore = mean(allStandardMeans);

      const hedonicAttr = session.sessionAttributes.find((sa) => sa.attribute.kind === "OVERALL_HEDONIC");
      const overallLikingValues = hedonicAttr ? (attrValues.get(hedonicAttr.attributeId) ?? []) : [];
      const overallLiking = mean(overallLikingValues);

      const composite =
        averageAttributeScore !== null && overallLiking !== null ? (averageAttributeScore + overallLiking) / 2 : null;
      // Deviation from Target = |Composite - 3|. This scale is JAR-style (Just-About-Right): 3 is
      // the ideal/target rating for every attribute, including Overall Liking — 1 and 5 are both
      // "unacceptable" in opposite directions. So deviation, not the raw composite, measures quality:
      // lower deviation is better, and rank is driven by deviation, never by composite magnitude alone.
      const deviation = composite !== null ? Math.abs(composite - 3) : null;

      return {
        sampleId: sample.id,
        sampleName: sample.sampleName,
        sampleCode: sample.sampleCode,
        sections,
        averageAttributeScore,
        overallLiking,
        composite,
        deviation,
        rank: null,
        submissionCount: submissionCountBySample.get(sample.id) ?? 0,
      };
    });

    // Rank 1 = closest to target (lowest deviation) — NOT the highest composite score, since 3 is
    // the ideal rating on this JAR scale and both 1 and 5 represent unacceptable extremes.
    const ranked = [...samples]
      .filter((s) => s.deviation !== null)
      .sort((a, b) => a.deviation! - b.deviation!);
    ranked.forEach((s, idx) => {
      const target = samples.find((x) => x.sampleId === s.sampleId);
      if (target) target.rank = idx + 1;
    });

    return {
      sessionProductId: sp.id,
      productId: sp.productId,
      productName: sp.product.name,
      samples,
    };
  });

  const totalPanelists = await prisma.panelistVisit.count({ where: { sessionId } });
  const totalSubmissions = await prisma.submission.count({
    where: { excluded: false, sample: { sessionProduct: { sessionId } } },
  });

  return { sessionId, totalPanelists, totalSubmissions, products };
}
