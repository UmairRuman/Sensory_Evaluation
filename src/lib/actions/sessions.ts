"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generatePublicToken, generateJoinCode } from "@/lib/session/tokens";
import { getCategoryMasterfile, attributeAppliesToProduct } from "@/lib/masterfile/queries";
import { createSessionSchema, type CreateSessionInput } from "@/lib/validation/session";

export type CreateSessionResult = { error: string } | never;

export async function createAndPublishSession(input: CreateSessionInput): Promise<CreateSessionResult> {
  const authSession = await auth();
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { error: "You must be signed in as an admin to create a session." };
  }

  const parsed = createSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid session configuration." };
  }
  const data = parsed.data;

  const category = await getCategoryMasterfile(data.categoryId);
  if (!category) {
    return { error: "Product category not found." };
  }

  const productIds = data.products.map((p) => p.productId);
  const disabledSet = new Set(data.disabledAttributeIds);

  const sectionRows: { sectionId: string; enabled: boolean; sortOrder: number }[] = [];
  const attributeRows: { attributeId: string; enabled: boolean; sortOrder: number }[] = [];

  for (const section of category.sections) {
    let sectionApplies = false;
    for (const attribute of section.attributes) {
      const appliesToAny = productIds.some((pid) => attributeAppliesToProduct(attribute, pid));
      if (!appliesToAny) continue;
      sectionApplies = true;
      attributeRows.push({
        attributeId: attribute.id,
        enabled: !disabledSet.has(attribute.id),
        sortOrder: attribute.sortOrder,
      });
    }
    if (sectionApplies) {
      sectionRows.push({ sectionId: section.id, enabled: true, sortOrder: section.sortOrder });
    }
  }

  if (attributeRows.length === 0) {
    return { error: "None of the masterfile attributes apply to the selected products." };
  }

  let sessionId: string | null = null;
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && !sessionId; attempt++) {
    const publicToken = generatePublicToken();
    const joinCode = generateJoinCode();

    try {
      const created = await prisma.$transaction(async (tx) => {
        const newSession = await tx.session.create({
          data: {
            name: data.name,
            categoryId: data.categoryId,
            evaluationType: data.evaluationType,
            status: "ACTIVE",
            region: data.region || null,
            entity: data.entity || null,
            publicToken,
            joinCode,
            createdById: authSession.user.id,
            publishedAt: new Date(),
          },
        });

        for (const p of data.products) {
          const sessionProduct = await tx.sessionProduct.create({
            data: { sessionId: newSession.id, productId: p.productId },
          });
          await tx.sample.createMany({
            data: p.samples.map((s, idx) => ({
              sessionProductId: sessionProduct.id,
              sampleName: s.sampleName,
              sampleCode: s.sampleCode,
              brandName: s.brandName || null,
              batchNo: s.batchNo || null,
              plantLine: s.plantLine || null,
              sortOrder: idx,
            })),
          });
        }

        await tx.sessionSection.createMany({
          data: sectionRows.map((r) => ({ sessionId: newSession.id, ...r })),
        });
        await tx.sessionAttribute.createMany({
          data: attributeRows.map((r) => ({ sessionId: newSession.id, ...r })),
        });

        return newSession;
      });

      sessionId = created.id;
    } catch (err) {
      const isTokenCollision = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isTokenCollision || attempt === MAX_ATTEMPTS - 1) throw err;
      // retry with freshly generated token/joinCode on the rare collision
    }
  }

  if (!sessionId) {
    return { error: "Could not allocate a unique session link. Please try again." };
  }

  redirect(`/sessions/${sessionId}?published=1`);
}

export async function closeSession(sessionId: string) {
  const authSession = await auth();
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CLOSED", closedAt: new Date() },
  });
}
