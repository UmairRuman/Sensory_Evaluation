import type { EvaluationType } from "@prisma/client";
import type { ProductAggregate, SampleAggregate } from "./aggregate";

function closestToTarget(sample: SampleAggregate) {
  const scored = sample.sections.filter((s) => s.average !== null);
  if (scored.length === 0) return null;
  return scored.reduce((best, s) => (Math.abs(s.average! - 3) < Math.abs(best.average! - 3) ? s : best));
}

function weakestAttribute(sample: SampleAggregate) {
  const all = sample.sections.flatMap((s) => s.attributes).filter((a) => a.average !== null);
  if (all.length === 0) return null;
  return all.reduce((worst, a) => (Math.abs(a.average! - 3) > Math.abs(worst.average! - 3) ? a : worst));
}

function evaluationFraming(evaluationType: EvaluationType): string {
  switch (evaluationType) {
    case "NPD":
      return "As a new product development trial, results should guide formulation refinement before scale-up.";
    case "COMPETITIVE_BENCHMARK":
      return "As a competitive benchmark, this ranking reflects standing against the comparison set evaluated in this session.";
    case "ROUTINE_QC":
      return "As routine QC, any sample deviating materially from target should be flagged for batch review.";
  }
}

export function generateProductNarrative(product: ProductAggregate, evaluationType: EvaluationType): string {
  const scored = product.samples.filter((s) => s.rank !== null);
  if (scored.length === 0) {
    return `No panelist submissions yet for ${product.productName}.`;
  }

  // Winner = rank 1 (lowest deviation from target), not the highest composite score — this is a
  // JAR-style scale where 3 is ideal, so "highest" is meaningless without direction.
  const winner = [...scored].sort((a, b) => a.rank! - b.rank!)[0];
  const strongSection = closestToTarget(winner);
  const weakAttr = weakestAttribute(winner);
  const panelistCount = winner.submissionCount;

  const sentences: string[] = [];
  sentences.push(
    `Across ${scored.length} sample${scored.length === 1 ? "" : "s"} of ${product.productName}, ${winner.sampleName} ranked closest to target with a composite score of ${winner.composite!.toFixed(2)} (deviation ${winner.deviation!.toFixed(2)}, ${panelistCount} submission${panelistCount === 1 ? "" : "s"}).`
  );
  if (strongSection) {
    sentences.push(
      `Its strongest section was ${strongSection.letter}. ${strongSection.name}, averaging ${strongSection.average!.toFixed(2)} against the target of 3.`
    );
  }
  if (weakAttr && Math.abs(weakAttr.average! - 3) >= 0.5) {
    sentences.push(`${weakAttr.name} showed the largest deviation from target (${weakAttr.average!.toFixed(2)}) and may warrant attention.`);
  }
  sentences.push(evaluationFraming(evaluationType));

  return sentences.join(" ");
}
