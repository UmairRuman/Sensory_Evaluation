export interface FlatSample {
  sessionProductId: string;
  sampleId: string;
}

export function flattenSamples(sessionProducts: { id: string; samples: { id: string }[] }[]): FlatSample[] {
  return sessionProducts.flatMap((sp) => sp.samples.map((sample) => ({ sessionProductId: sp.id, sampleId: sample.id })));
}

export function nextSample(flat: FlatSample[], currentSampleId: string): FlatSample | null {
  const idx = flat.findIndex((f) => f.sampleId === currentSampleId);
  if (idx === -1 || idx === flat.length - 1) return null;
  return flat[idx + 1];
}
