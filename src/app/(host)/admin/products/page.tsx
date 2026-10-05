import { prisma } from "@/lib/prisma";
import { ManageProductsClient } from "@/components/admin/manage-products-client";

export default async function ManageProductsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: { orderBy: { sortOrder: "asc" } },
      _count: { select: { sessions: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.16em] text-brand-accent">
        Admin
      </p>
      <h1 className="mt-1 mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-primary-strong">
        Manage Products
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        Add product categories and SKUs without a developer. New SKUs automatically inherit their
        category&apos;s sensory parameters.
      </p>
      <ManageProductsClient
        categories={categories.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          isActive: c.isActive,
          sessionCount: c._count.sessions,
          products: c.products.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            brand: p.brand,
            notes: p.notes,
            isActive: p.isActive,
          })),
        }))}
      />
    </div>
  );
}
