import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import type { CategorySeed } from "./seed-data/types";
import { data as cat1 } from "./seed-data/cat1-bread-buns";
import { data as cat2 } from "./seed-data/cat2-shawarma-tortilla";
import { data as cat3 } from "./seed-data/cat3-parathas-naan-sheermal";
import { data as cat4 } from "./seed-data/cat4-samosa";
import { data as cat5 } from "./seed-data/cat5-rusks";
import { data as cat6 } from "./seed-data/cat6-cakes-muffins-cupcakes";
import { data as cat7 } from "./seed-data/cat7-chicken-products";
import { data as cat8 } from "./seed-data/cat8-kebabs";
import { data as cat9 } from "./seed-data/cat9-pizza-toppings";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories: CategorySeed[] = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedCategory(categorySeed: CategorySeed, categoryIndex: number) {
  const category = await prisma.category.upsert({
    where: { key: categorySeed.key },
    update: { title: categorySeed.title, sortOrder: categoryIndex },
    create: { key: categorySeed.key, title: categorySeed.title, sortOrder: categoryIndex },
  });

  const productIdBySlug = new Map<string, string>();
  for (let i = 0; i < categorySeed.products.length; i++) {
    const p = categorySeed.products[i];
    const product = await prisma.product.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: p.slug } },
      update: { name: p.name, sortOrder: i },
      create: { categoryId: category.id, slug: p.slug, name: p.name, sortOrder: i },
    });
    productIdBySlug.set(p.slug, product.id);
  }

  for (let s = 0; s < categorySeed.sections.length; s++) {
    const sectionSeed = categorySeed.sections[s];
    const section = await prisma.section.upsert({
      where: { categoryId_letter: { categoryId: category.id, letter: sectionSeed.letter } },
      update: { name: sectionSeed.name, sortOrder: s },
      create: { categoryId: category.id, letter: sectionSeed.letter, name: sectionSeed.name, sortOrder: s },
    });

    for (let a = 0; a < sectionSeed.attributes.length; a++) {
      const attrSeed = sectionSeed.attributes[a];
      const slug = attrSeed.slug ?? slugify(attrSeed.name);
      const defaultApplicable = !attrSeed.only; // if `only` is set, it's restricted; `skip` keeps default true

      const attribute = await prisma.attribute.upsert({
        where: { sectionId_slug: { sectionId: section.id, slug } },
        update: {
          name: attrSeed.name,
          kind: attrSeed.kind ?? "STANDARD",
          lowLabel: attrSeed.low,
          midLabel: attrSeed.mid,
          highLabel: attrSeed.high,
          defaultApplicable,
          sortOrder: a,
        },
        create: {
          sectionId: section.id,
          slug,
          name: attrSeed.name,
          kind: attrSeed.kind ?? "STANDARD",
          lowLabel: attrSeed.low,
          midLabel: attrSeed.mid,
          highLabel: attrSeed.high,
          defaultApplicable,
          sortOrder: a,
        },
      });

      if (attrSeed.only) {
        for (const productSlug of attrSeed.only) {
          const productId = productIdBySlug.get(productSlug);
          if (!productId) {
            throw new Error(`[${categorySeed.key}] attribute "${attrSeed.slug}" references unknown product slug "${productSlug}"`);
          }
          await prisma.attributeProductOverride.upsert({
            where: { attributeId_productId: { attributeId: attribute.id, productId } },
            update: { applies: true },
            create: { attributeId: attribute.id, productId, applies: true },
          });
        }
      }

      if (attrSeed.skip) {
        for (const productSlug of attrSeed.skip) {
          const productId = productIdBySlug.get(productSlug);
          if (!productId) {
            throw new Error(`[${categorySeed.key}] attribute "${attrSeed.slug}" references unknown product slug "${productSlug}"`);
          }
          await prisma.attributeProductOverride.upsert({
            where: { attributeId_productId: { attributeId: attribute.id, productId } },
            update: { applies: false },
            create: { attributeId: attribute.id, productId, applies: false },
          });
        }
      }
    }
  }

  return category;
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "CQA Admin";
  if (!email || !password) {
    console.warn("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping bootstrap admin user.");
    return null;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash, role: "ADMIN" },
  });
}

async function main() {
  console.log(`Seeding ${categories.length} categories...`);
  for (let i = 0; i < categories.length; i++) {
    const category = await seedCategory(categories[i], i);
    console.log(`  ✓ ${category.title}`);
  }

  const admin = await seedAdmin();
  if (admin) {
    console.log(`  ✓ bootstrap admin user: ${admin.email}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
