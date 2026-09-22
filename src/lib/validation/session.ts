import { z } from "zod";

export const sampleInputSchema = z.object({
  sampleName: z.string().min(1, "Sample name is required"),
  sampleCode: z.string().min(1, "Sample code is required"),
  brandName: z.string().optional(),
  batchNo: z.string().optional(),
  plantLine: z.string().optional(),
});

export const sessionProductInputSchema = z.object({
  productId: z.string().min(1),
  samples: z.array(sampleInputSchema).min(1, "Add at least one sample"),
});

export const createSessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  categoryId: z.string().min(1),
  evaluationType: z.enum(["NPD", "COMPETITIVE_BENCHMARK", "ROUTINE_QC"]),
  region: z.string().optional(),
  entity: z.string().optional(),
  products: z.array(sessionProductInputSchema).min(1, "Select at least one product"),
  disabledAttributeIds: z.array(z.string()).default([]),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
