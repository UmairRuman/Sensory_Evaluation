"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "./admin-guard";
import { copyParametersInternal } from "./admin-parameters";
import { uniqueSlug } from "@/lib/masterfile/slug";
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
} from "@/lib/validation/admin";

type ActionResult = { error: string } | { ok: true; id: string };

export async function createCategory(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, description, copyFromCategoryId } = parsed.data;

  const existing = await prisma.category.findFirst({ where: { title: { equals: name, mode: "insensitive" } } });
  if (existing) return { error: `A category named "${name}" already exists.` };

  const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const taken = new Set((await prisma.category.findMany({ select: { key: true } })).map((c) => c.key));

  const created = await prisma.category.create({
    data: {
      key: uniqueSlug(name, taken),
      title: name,
      description: description || null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  if (copyFromCategoryId) {
    const result = await copyParametersInternal({
      sourceCategoryId: copyFromCategoryId,
      targetCategoryId: created.id,
      mode: "append", // target is brand new/empty, so append == full copy with no possible conflicts
      resolutions: [],
    });
    if ("error" in result) {
      // Roll back the otherwise-orphaned empty category rather than leaving it behind.
      await prisma.category.delete({ where: { id: created.id } });
      return { error: `Could not copy parameters, so the category was not created: ${result.error}` };
    }
  }

  revalidatePath("/admin/products");
  return { ok: true, id: created.id };
}

export async function updateCategory(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { id, name, description, isActive } = parsed.data;

  if (name) {
    const dupe = await prisma.category.findFirst({
      where: { title: { equals: name, mode: "insensitive" }, id: { not: id } },
    });
    if (dupe) return { error: `A category named "${name}" already exists.` };
  }

  await prisma.category.update({
    where: { id },
    data: { title: name, description, isActive },
  });

  revalidatePath("/admin/products");
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const sessionCount = await prisma.session.count({ where: { categoryId: id } });
  if (sessionCount > 0) {
    return { error: "This category has evaluation sessions against it — archive it instead, or delete those evaluations first." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.attributeProductOverride.deleteMany({ where: { product: { categoryId: id } } });
    await tx.attribute.deleteMany({ where: { section: { categoryId: id } } });
    await tx.section.deleteMany({ where: { categoryId: id } });
    await tx.product.deleteMany({ where: { categoryId: id } });
    await tx.category.delete({ where: { id } });
  });

  revalidatePath("/admin/products");
  return { ok: true, id };
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { categoryId, name, code, brand, notes } = parsed.data;

  const dupe = await prisma.product.findFirst({
    where: { categoryId, name: { equals: name, mode: "insensitive" } },
  });
  if (dupe) return { error: `A SKU named "${name}" already exists in this category.` };

  const maxSort = await prisma.product.aggregate({ where: { categoryId }, _max: { sortOrder: true } });
  const taken = new Set((await prisma.product.findMany({ where: { categoryId }, select: { slug: true } })).map((p) => p.slug));

  const created = await prisma.product.create({
    data: {
      categoryId,
      name,
      slug: uniqueSlug(name, taken),
      code: code || null,
      brand: brand || null,
      notes: notes || null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/admin/products");
  return { ok: true, id: created.id };
}

export async function updateProduct(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { id, name, code, brand, notes, isActive } = parsed.data;

  if (name) {
    const product = await prisma.product.findUniqueOrThrow({ where: { id } });
    const dupe = await prisma.product.findFirst({
      where: { categoryId: product.categoryId, name: { equals: name, mode: "insensitive" }, id: { not: id } },
    });
    if (dupe) return { error: `A SKU named "${name}" already exists in this category.` };
  }

  await prisma.product.update({ where: { id }, data: { name, code, brand, notes, isActive } });

  revalidatePath("/admin/products");
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized." };

  const sessionProductCount = await prisma.sessionProduct.count({ where: { productId: id } });
  if (sessionProductCount > 0) {
    return { error: "This SKU has evaluation sessions against it — archive it instead, or delete those evaluations first." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.attributeProductOverride.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  revalidatePath("/admin/products");
  return { ok: true, id };
}
