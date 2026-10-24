import { z } from "zod";

export const sampleInputSchema = z.object({
  sampleName: z.string().min(1, "Sample name is required"),
  sampleCode: z.string().trim().min(1, "Sample code is required"),
  brandName: z.string().optional(),
  batchNo: z.string().optional(),
  plantLine: z.string().optional(),
});

export const sessionProductInputSchema = z.object({
  productId: z.string().min(1),
  samples: z.array(sampleInputSchema).min(1, "Add at least one sample"),
});

export const createSessionSchema = z
  .object({
    name: z.string().min(1, "Session name is required"),
    categoryId: z.string().min(1),
    evaluationType: z.enum(["NPD", "COMPETITIVE_BENCHMARK", "ROUTINE_QC"]),
    region: z.string().optional(),
    entity: z.string().optional(),
    products: z.array(sessionProductInputSchema).min(1, "Select at least one product"),
    disabledAttributeIds: z.array(z.string()).default([]),
    isTest: z.boolean().default(false),
  })
  // Panelists never see which product a sample belongs to, so a code collision across two
  // different products in the same session would silently merge them from the panelist's view —
  // uniqueness has to be checked session-wide here, not just per product.
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.products.forEach((product, productIdx) => {
      product.samples.forEach((sample, sampleIdx) => {
        const key = sample.sampleCode.toLowerCase();
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Sample code "${sample.sampleCode}" is used more than once — codes must be unique within a session.`,
            path: ["products", productIdx, "samples", sampleIdx, "sampleCode"],
          });
        }
        seen.add(key);
      });
    });
  });

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
