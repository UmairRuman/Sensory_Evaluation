import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(120),
  description: z.string().trim().max(1000).optional(),
  copyFromCategoryId: z.string().optional(),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Category name is required").max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const createProductSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1, "SKU name is required").max(160),
  code: z.string().trim().max(60).optional(),
  brand: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(160).optional(),
  code: z.string().trim().max(60).optional(),
  brand: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const createParentParameterSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1, "Parameter name is required").max(120),
  description: z.string().trim().max(1000).optional(),
});

export const updateParentParameterSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
});

export const createSubParameterSchema = z.object({
  sectionId: z.string().min(1),
  name: z.string().trim().min(1, "Sub-parameter name is required").max(120),
  description: z.string().trim().max(1000).optional(),
  lowLabel: z.string().trim().min(1, "Below-target descriptor is required").max(200),
  midLabel: z.string().trim().min(1, "Target descriptor is required").max(200),
  highLabel: z.string().trim().min(1, "Above-target descriptor is required").max(200),
});

export const updateSubParameterSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  lowLabel: z.string().trim().min(1).max(200).optional(),
  midLabel: z.string().trim().min(1).max(200).optional(),
  highLabel: z.string().trim().min(1).max(200).optional(),
});

export const conflictResolutionSchema = z.object({
  sourceParentParameterId: z.string(),
  action: z.enum(["skip", "rename", "merge"]),
  renameTo: z.string().trim().max(120).optional(),
});

export const copyParametersSchema = z.object({
  sourceCategoryId: z.string().min(1),
  targetCategoryId: z.string().min(1),
  mode: z.enum(["replace", "append"]),
  resolutions: z.array(conflictResolutionSchema).default([]),
});
