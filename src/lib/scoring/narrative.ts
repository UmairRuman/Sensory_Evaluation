import type { EvaluationType } from "@prisma/client";
import type { ProductAggregate } from "./aggregate";

const CONCERN_THRESHOLD = 40; // targetPct below this, even for the section leader, is flagged

export interface SectionVerdict {
  sectionId: string;
  letter: string;
  name: string;
  text: string;
}

export interface ProductVerdict {
  sectionVerdicts: SectionVerdict[];
  overallSummary: string;
  concerns: string[];
}

function evaluationFraming(evaluationType: EvaluationType): string {
  switch (evaluationType) {
    case "NPD":
      return "As a new product development trial, results should guide formulation refinement before scale-up.";
    case "COMPETITIVE_BENCHMARK":
      return "As a competitive benchmark, this ranking reflects standing against the comparison set evaluated in this session.";
    case "ROUTINE_QC":
      return "As routine QC, any parameter with low target agreement should be flagged for batch review.";
  }
}

export function generateProductVerdict(product: ProductAggregate, evaluationType: EvaluationType): ProductVerdict {
  const hasData = product.samples.some((s) => s.sections.some((sec) => sec.targetPct !== null));
  if (!hasData) {
    return {
      sectionVerdicts: [],
      overallSummary: `No panelist submissions yet for ${product.productName}.`,
      concerns: [],
    };
  }

  const sectionOrder = product.samples[0]?.sections ?? [];
  const sectionVerdicts: SectionVerdict[] = [];
  const concerns: string[] = [];
  const firstPlaceCounts = new Map<string, number>(); // sampleId -> # sections led
  const meanTargetPctBySample = new Map<string, { sum: number; n: number }>();

  for (const sectionMeta of sectionOrder) {
    const entries = product.samples
      .map((s) => ({ sample: s, section: s.sections.find((sec) => sec.sectionId === sectionMeta.sectionId) }))
      .filter((e): e is { sample: (typeof product.samples)[number]; section: NonNullable<typeof e.section> } => e.section !== undefined && e.section.targetPct !== null);

    for (const e of entries) {
      const agg = meanTargetPctBySample.get(e.sample.sampleId) ?? { sum: 0, n: 0 };
      agg.sum += e.section.targetPct!;
      agg.n += 1;
      meanTargetPctBySample.set(e.sample.sampleId, agg);
    }

    const leader = entries.find((e) => e.section.rank === 1);
    if (!leader) continue;

    firstPlaceCounts.set(leader.sample.sampleId, (firstPlaceCounts.get(leader.sample.sampleId) ?? 0) + 1);

    sectionVerdicts.push({
      sectionId: sectionMeta.sectionId,
      letter: sectionMeta.letter,
      name: sectionMeta.name,
      text: `${leader.sample.sampleName} led ${sectionMeta.letter}. ${sectionMeta.name} with ${leader.section.targetPct!.toFixed(0)}% of panelists rating Target.`,
    });

    if (leader.section.targetPct! < CONCERN_THRESHOLD) {
      concerns.push(
        `${sectionMeta.letter}. ${sectionMeta.name} — even the leading sample (${leader.sample.sampleName}) only reached ${leader.section.targetPct!.toFixed(0)}% target agreement.`
      );
    }
  }

  let overallSummary = `No ranked sections yet for ${product.productName}.`;
  if (firstPlaceCounts.size > 0) {
    const bestSampleId = [...firstPlaceCounts.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      const aMean = meanTargetPctBySample.get(a[0]);
      const bMean = meanTargetPctBySample.get(b[0]);
      const aAvg = aMean ? aMean.sum / aMean.n : 0;
      const bAvg = bMean ? bMean.sum / bMean.n : 0;
      return bAvg - aAvg;
    })[0][0];
    const bestSample = product.samples.find((s) => s.sampleId === bestSampleId)!;
    const leadCount = firstPlaceCounts.get(bestSampleId)!;
    overallSummary = `Across ${sectionOrder.length} parameter${sectionOrder.length === 1 ? "" : "s"} of ${product.productName}, ${bestSample.sampleName} performed best overall, leading ${leadCount} of ${sectionVerdicts.length} ranked parameter${sectionVerdicts.length === 1 ? "" : "s"}. ${evaluationFraming(evaluationType)}`;
  }

  return { sectionVerdicts, overallSummary, concerns };
}
