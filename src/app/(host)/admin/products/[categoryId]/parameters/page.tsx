import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ManageParametersClient } from "@/components/admin/manage-parameters-client";

export default async function ManageParametersPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      sections: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { attributes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!category) notFound();

  const otherCategories = await prisma.category.findMany({
    where: { id: { not: categoryId } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/admin/products" className="text-sm font-medium text-brand-primary hover:underline">
        ← Manage Products
      </Link>
      <p className="mt-3 font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.16em] text-brand-accent">
        {category.title}
      </p>
      <h1 className="mt-1 mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-primary-strong">
        Manage Parameters
      </h1>
      <ManageParametersClient
        categoryId={category.id}
        sections={category.sections.map((s) => ({
          id: s.id,
          letter: s.letter,
          name: s.name,
          description: s.description,
          attributes: s.attributes.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            lowLabel: a.lowLabel,
            midLabel: a.midLabel,
            highLabel: a.highLabel,
            kind: a.kind,
          })),
        }))}
        otherCategories={otherCategories}
      />
    </div>
  );
}
