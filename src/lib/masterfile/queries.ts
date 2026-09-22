import { prisma } from "@/lib/prisma";
export { attributeAppliesToProduct } from "./applicability";

export async function listCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryMasterfile(categoryId: string) {
  return prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      sections: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          attributes: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: { overrides: true },
          },
        },
      },
    },
  });
}

export type CategoryMasterfile = NonNullable<Awaited<ReturnType<typeof getCategoryMasterfile>>>;
