"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generatePublicToken, generateJoinCode } from "@/lib/session/tokens";
import { getCategoryMasterfile } from "@/lib/masterfile/queries";
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

  const disabledSet = new Set(data.disabledAttributeIds);

  const sectionRows: { sectionId: string; letter: string; name: string; enabled: boolean; sortOrder: number }[] = [];
  const attributeRows: {
    attributeId: string;
    name: string;
    lowLabel: string;
    midLabel: string;
    highLabel: string;
    enabled: boolean;
    sortOrder: number;
  }[] = [];

  // Every active section/attribute in the category becomes a row here — selection is driven
  // entirely by the admin's explicit wizard checkboxes (disabledSet), not re-derived from
  // per-product applicability, so what the admin saw and picked is exactly what gets published.
  // Snapshot display text (name/letter/labels) at publish time too, not just which sections/
  // attributes apply — this is what makes a later masterfile rename never relabel an already-
  // published session.
  for (const section of category.sections) {
    if (section.attributes.length === 0) continue;
    for (const attribute of section.attributes) {
      attributeRows.push({
        attributeId: attribute.id,
        name: attribute.name,
        lowLabel: attribute.lowLabel,
        midLabel: attribute.midLabel,
        highLabel: attribute.highLabel,
        enabled: !disabledSet.has(attribute.id),
        sortOrder: attribute.sortOrder,
      });
    }
    sectionRows.push({
      sectionId: section.id,
      letter: section.letter,
      name: section.name,
      enabled: true,
      sortOrder: section.sortOrder,
    });
  }

  if (attributeRows.length === 0) {
    return { error: "This category has no active parameters configured." };
  }

  let sessionId: string | null = null;
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && !sessionId; attempt++) {
    const publicToken = generatePublicToken();
    const joinCode = generateJoinCode();

    try {
      const created = await prisma.$transaction(
        async (tx) => {
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
              isTest: data.isTest,
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
        },
        // Neon's network latency can exceed Prisma's 5s default interactive-transaction timeout
        // for this multi-step insert — same fix already applied to other bulk-write transactions
        // in this codebase (admin-parameters.ts, admin-deletions.ts) — plus a longer maxWait since
        // acquiring the connection itself (not just running the transaction) can be slow too.
        { maxWait: 10000, timeout: 20000 }
      );

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
