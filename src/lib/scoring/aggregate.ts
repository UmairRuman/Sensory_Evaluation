import { prisma } from "@/lib/prisma";

// Scoring is JAR-style (Just-About-Right): 3 is the ideal rating for every attribute, so a
// parameter's quality is the share of panelists who rated it exactly 3 ("Target"), never a mean
// of the raw 1-5 values. Averaging would treat a coherent "everyone said 5" the same as a
// coherent "everyone said 3," which is backwards on this scale.

export interface AttributeTargetScore {
  attributeId: string;
  name: string;
  targetPct: number | null; // % of respondents rating exactly 3
  nearTargetPct: number | null; // % of respondents rating 2 or 4 (tie-break signal)
  count: number;
}

export interface SectionTargetScore {
  sectionId: string;
  letter: string;
  name: string;
  targetPct: number | null; // mean of this section's attribute targetPct values
  nearTargetPct: number | null; // mean of this section's attribute nearTargetPct values
  rank: number | null; // this sample's rank within this section, among the product's samples
  attributes: AttributeTargetScore[];
}

export interface SampleScore {
  sampleId: string;
  sampleName: string;
  sampleCode: string;
  sections: SectionTargetScore[];
  submissionCount: number;
}

export interface ProductAggregate {
  sessionProductId: string;
  productId: string;
  productName: string;
  samples: SampleScore[];
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

function targetStats(values: number[]): { targetPct: number | null; nearTargetPct: number | null; count: number } {
  if (values.length === 0) return { targetPct: null, nearTargetPct: null, count: 0 };
  const targetCount = values.filter((v) => v === 3).length;
  const nearCount = values.filter((v) => v === 2 || v === 4).length;
  return {
    targetPct: (targetCount / values.length) * 100,
    nearTargetPct: (nearCount / values.length) * 100,
    count: values.length,
  };
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
    const samples: SampleScore[] = sp.samples.map((sample) => {
      const attrValues = valuesBySample.get(sample.id) ?? new Map<string, number[]>();

      const sections: SectionTargetScore[] = session.sessionSections.map((ss) => {
        const attrs = attributesBySection.get(ss.sectionId) ?? [];
        const attributeScores: AttributeTargetScore[] = attrs.map((sa) => {
          const values = attrValues.get(sa.attributeId) ?? [];
          const stats = targetStats(values);
          return { attributeId: sa.attributeId, name: sa.attribute.name, ...stats };
        });
        const sectionTargetPcts = attributeScores.map((a) => a.targetPct).filter((v): v is number => v !== null);
        const sectionNearPcts = attributeScores.map((a) => a.nearTargetPct).filter((v): v is number => v !== null);
        return {
          sectionId: ss.sectionId,
          letter: ss.section.letter,
          name: ss.section.name,
          targetPct: mean(sectionTargetPcts),
          nearTargetPct: mean(sectionNearPcts),
          rank: null,
          attributes: attributeScores,
        };
      });

      return {
        sampleId: sample.id,
        sampleName: sample.sampleName,
        sampleCode: sample.sampleCode,
        sections,
        submissionCount: submissionCountBySample.get(sample.id) ?? 0,
      };
    });

    // Rank is computed per section (parent parameter), never as a single overall composite —
    // rank 1 = highest targetPct within that section among this product's samples, tie-broken
    // by nearTargetPct (more 2s/4s beats more 1s/5s at the same target-% level).
    for (const section of session.sessionSections) {
      const entries = samples
        .map((s) => s.sections.find((sec) => sec.sectionId === section.sectionId))
        .filter((sec): sec is SectionTargetScore => sec !== undefined && sec.targetPct !== null);
      const ranked = [...entries].sort(
        (a, b) => b.targetPct! - a.targetPct! || (b.nearTargetPct ?? 0) - (a.nearTargetPct ?? 0)
      );
      ranked.forEach((sec, idx) => {
        sec.rank = idx + 1;
      });
    }

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
