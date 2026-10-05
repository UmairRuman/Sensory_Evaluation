"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "./admin-guard";
import { uniqueSlug } from "@/lib/masterfile/slug";
import {
  createParentParameterSchema,
  updateParentParameterSchema,
  createSubParameterSchema,
  updateSubParameterSchema,
  copyParametersSchema,
  type conflictResolutionSchema,
} from "@/lib/validation/admin";
import type { z } from "zod";

type ActionResult = { error: string } | { ok: true; id: string };
type ConflictResolution = z.infer<typeof conflictResolutionSchema>;

function letterForIndex(index: number): string {
  // A, B, ... Z, AA, AB, ... — realistically never needed past single letters, but safe regardless.
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

export async function createParentParameter(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = createParentParameterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { categoryId, name, description } = parsed.data;

  const dupe = await prisma.section.findFirst({
    where: { categoryId, name: { equals: name, mode: "insensitive" }, isActive: true },
  });
  if (dupe) return { error: `A parent parameter named "${name}" already exists in this category.` };

  const activeCount = await prisma.section.count({ where: { categoryId, isActive: true } });
  const maxSort = await prisma.section.aggregate({ where: { categoryId }, _max: { sortOrder: true } });

  const created = await prisma.section.create({
    data: {
      categoryId,
      letter: letterForIndex(activeCount),
      name,
      description: description || null,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/products/${categoryId}/parameters`);
  return { ok: true, id: created.id };
}

export async function updateParentParameter(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = updateParentParameterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { id, name, description } = parsed.data;

  const section = await prisma.section.findUniqueOrThrow({ where: { id } });
  if (name) {
    const dupe = await prisma.section.findFirst({
      where: { categoryId: section.categoryId, name: { equals: name, mode: "insensitive" }, isActive: true, id: { not: id } },
    });
    if (dupe) return { error: `A parent parameter named "${name}" already exists in this category.` };
  }

  await prisma.section.update({ where: { id }, data: { name, description } });
  revalidatePath(`/admin/products/${section.categoryId}/parameters`);
  return { ok: true, id };
}

/** "Remove" per the CR is never a hard delete — it only hides the parameter from new proformas.
 * Historical sessions reference Section/Attribute rows directly and never check isActive. */
export async function removeParentParameter(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const section = await prisma.section.update({ where: { id }, data: { isActive: false } });
  await prisma.attribute.updateMany({ where: { sectionId: id }, data: { isActive: false } });

  revalidatePath(`/admin/products/${section.categoryId}/parameters`);
  return { ok: true, id };
}

export async function reorderParentParameters(categoryId: string, orderedIds: string[]): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.section.update({ where: { id }, data: { sortOrder: idx, letter: letterForIndex(idx) } })
    )
  );

  revalidatePath(`/admin/products/${categoryId}/parameters`);
  return { ok: true, id: categoryId };
}

export async function createSubParameter(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = createSubParameterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { sectionId, name, description, lowLabel, midLabel, highLabel } = parsed.data;

  const dupe = await prisma.attribute.findFirst({
    where: { sectionId, name: { equals: name, mode: "insensitive" }, isActive: true },
  });
  if (dupe) return { error: `A sub-parameter named "${name}" already exists under this parameter.` };

  const existingSlugs = new Set((await prisma.attribute.findMany({ where: { sectionId }, select: { slug: true } })).map((a) => a.slug));
  const maxSort = await prisma.attribute.aggregate({ where: { sectionId }, _max: { sortOrder: true } });
  const section = await prisma.section.findUniqueOrThrow({ where: { id: sectionId } });

  const created = await prisma.attribute.create({
    data: {
      sectionId,
      slug: uniqueSlug(name, existingSlugs),
      name,
      description: description || null,
      lowLabel,
      midLabel,
      highLabel,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/products/${section.categoryId}/parameters`);
  return { ok: true, id: created.id };
}

export async function updateSubParameter(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = updateSubParameterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { id, name, description, lowLabel, midLabel, highLabel } = parsed.data;

  const attribute = await prisma.attribute.findUniqueOrThrow({ where: { id }, include: { section: true } });
  if (name) {
    const dupe = await prisma.attribute.findFirst({
      where: { sectionId: attribute.sectionId, name: { equals: name, mode: "insensitive" }, isActive: true, id: { not: id } },
    });
    if (dupe) return { error: `A sub-parameter named "${name}" already exists under this parameter.` };
  }

  await prisma.attribute.update({ where: { id }, data: { name, description, lowLabel, midLabel, highLabel } });
  revalidatePath(`/admin/products/${attribute.section.categoryId}/parameters`);
  return { ok: true, id };
}

export async function removeSubParameter(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const attribute = await prisma.attribute.update({ where: { id }, data: { isActive: false }, include: { section: true } });
  revalidatePath(`/admin/products/${attribute.section.categoryId}/parameters`);
  return { ok: true, id };
}

export async function reorderSubParameters(sectionId: string, orderedIds: string[]): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  await prisma.$transaction(orderedIds.map((id, idx) => prisma.attribute.update({ where: { id }, data: { sortOrder: idx } })));

  const section = await prisma.section.findUniqueOrThrow({ where: { id: sectionId } });
  revalidatePath(`/admin/products/${section.categoryId}/parameters`);
  return { ok: true, id: sectionId };
}

// --- Copy parameters between categories (Change 2) ---

export interface CopyPreview {
  sourceSections: { id: string; name: string; subParameterCount: number }[];
  conflicts: { id: string; name: string }[]; // only populated for mode "append"
  targetCurrentSections: { id: string; name: string }[]; // informational, shown when mode "replace"
}

export async function previewCopyParameters(
  sourceCategoryId: string,
  targetCategoryId: string,
  mode: "replace" | "append"
): Promise<{ error: string } | { ok: true; preview: CopyPreview }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const source = await prisma.category.findUnique({
    where: { id: sourceCategoryId },
    include: { sections: { where: { isActive: true }, include: { attributes: { where: { isActive: true } } }, orderBy: { sortOrder: "asc" } } },
  });
  if (!source) return { error: "Source category not found." };

  const target = await prisma.category.findUnique({
    where: { id: targetCategoryId },
    include: { sections: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!target) return { error: "Target category not found." };

  const targetNames = new Set(target.sections.map((s) => s.name.toLowerCase()));
  const conflicts =
    mode === "append" ? source.sections.filter((s) => targetNames.has(s.name.toLowerCase())).map((s) => ({ id: s.id, name: s.name })) : [];

  return {
    ok: true,
    preview: {
      sourceSections: source.sections.map((s) => ({ id: s.id, name: s.name, subParameterCount: s.attributes.length })),
      conflicts,
      targetCurrentSections: target.sections.map((s) => ({ id: s.id, name: s.name })),
    },
  };
}

export async function applyCopyParameters(input: unknown): Promise<{ error: string } | { ok: true }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = copyParametersSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  return copyParametersInternal(parsed.data);
}

/** Shared copy logic — called both by the "Copy parameters from another category" admin action
 * and by category creation's "copy from existing" option (which always uses mode "append" onto
 * a guaranteed-empty target, so conflicts never occur there). */
export async function copyParametersInternal(input: {
  sourceCategoryId: string;
  targetCategoryId: string;
  mode: "replace" | "append";
  resolutions: ConflictResolution[];
}): Promise<{ error: string } | { ok: true }> {
  const { sourceCategoryId, targetCategoryId, mode, resolutions } = input;

  const source = await prisma.category.findUnique({
    where: { id: sourceCategoryId },
    include: { sections: { where: { isActive: true }, include: { attributes: { where: { isActive: true } } }, orderBy: { sortOrder: "asc" } } },
  });
  if (!source) return { error: "Source category not found." };

  const target = await prisma.category.findUnique({
    where: { id: targetCategoryId },
    include: { sections: { where: { isActive: true } } },
  });
  if (!target) return { error: "Target category not found." };

  const resolutionBySource = new Map(resolutions.map((r) => [r.sourceParentParameterId, r]));

  if (mode === "append") {
    const targetNames = new Set(target.sections.map((s) => s.name.toLowerCase()));
    const unresolved = source.sections.filter((s) => targetNames.has(s.name.toLowerCase()) && !resolutionBySource.has(s.id));
    if (unresolved.length > 0) {
      return { error: `Unresolved naming conflicts: ${unresolved.map((s) => s.name).join(", ")}. Choose Skip, Rename, or Merge for each.` };
    }
  }

  await prisma.$transaction(
    async (tx) => {
      if (mode === "replace") {
        await tx.section.updateMany({ where: { categoryId: targetCategoryId, isActive: true }, data: { isActive: false } });
        await tx.attribute.updateMany({ where: { section: { categoryId: targetCategoryId }, isActive: true }, data: { isActive: false } });
      }

      let sectionIndex = mode === "append" ? await tx.section.count({ where: { categoryId: targetCategoryId, isActive: true } }) : 0;

      for (const srcSection of source.sections) {
        const resolution = resolutionBySource.get(srcSection.id);
        if (resolution?.action === "skip") continue;

        if (resolution?.action === "merge") {
          const existingTarget = await tx.section.findFirst({
            where: { categoryId: targetCategoryId, name: { equals: srcSection.name, mode: "insensitive" }, isActive: true },
          });
          if (existingTarget) {
            const existingSlugs = new Set(
              (await tx.attribute.findMany({ where: { sectionId: existingTarget.id }, select: { slug: true } })).map((a) => a.slug)
            );
            let attrIndex = await tx.attribute.count({ where: { sectionId: existingTarget.id } });
            // Batched in one round-trip rather than one create() per attribute — sequential
            // per-row creates over Neon's network latency blew past Prisma's 5s tx timeout for
            // categories with 30-40+ attributes.
            await tx.attribute.createMany({
              data: srcSection.attributes.map((attr) => {
                const slug = uniqueSlug(attr.name, existingSlugs);
                existingSlugs.add(slug);
                return {
                  sectionId: existingTarget.id,
                  slug,
                  name: attr.name,
                  description: attr.description,
                  kind: attr.kind,
                  lowLabel: attr.lowLabel,
                  midLabel: attr.midLabel,
                  highLabel: attr.highLabel,
                  defaultApplicable: attr.defaultApplicable,
                  sortOrder: attrIndex++,
                };
              }),
            });
            continue;
          }
          // No existing target section to merge into — fall through and create fresh.
        }

        const newName = resolution?.action === "rename" && resolution.renameTo ? resolution.renameTo : srcSection.name;
        const newSection = await tx.section.create({
          data: {
            categoryId: targetCategoryId,
            letter: letterForIndex(sectionIndex),
            name: newName,
            description: srcSection.description,
            sortOrder: sectionIndex,
          },
        });
        sectionIndex++;

        const usedSlugs = new Set<string>();
        await tx.attribute.createMany({
          data: srcSection.attributes.map((attr, i) => {
            const slug = uniqueSlug(attr.name, usedSlugs);
            usedSlugs.add(slug);
            return {
              sectionId: newSection.id,
              slug,
              name: attr.name,
              description: attr.description,
              kind: attr.kind,
              lowLabel: attr.lowLabel,
              midLabel: attr.midLabel,
              highLabel: attr.highLabel,
              defaultApplicable: attr.defaultApplicable,
              sortOrder: i,
            };
          }),
        });
      }
    },
    { timeout: 20000 }
  );

  revalidatePath(`/admin/products/${targetCategoryId}/parameters`);
  return { ok: true };
}
