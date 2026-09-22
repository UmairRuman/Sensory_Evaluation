"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type JoinState = { error?: string } | undefined;

export async function joinSession(token: string, _prevState: JoinState, formData: FormData): Promise<JoinState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const ageRaw = formData.get("age");
  const age = ageRaw ? Number(ageRaw) : undefined;
  const gender = formData.get("gender") ? String(formData.get("gender")) : undefined;
  const department = formData.get("department") ? String(formData.get("department")) : undefined;

  const session = await prisma.session.findUnique({
    where: { publicToken: token },
    include: {
      sessionProducts: {
        orderBy: { sortOrder: "asc" },
        include: { samples: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!session) return { error: "Session not found." };
  if (session.status !== "ACTIVE") return { error: "This session is not currently accepting submissions." };

  const firstProduct = session.sessionProducts[0];
  const firstSample = firstProduct?.samples[0];
  if (!firstProduct || !firstSample) return { error: "This session has no samples configured yet." };

  const visit = await prisma.panelistVisit.create({
    data: { sessionId: session.id, name, age, gender, department },
  });

  redirect(`/s/${token}/product/${firstProduct.id}/sample/${firstSample.id}?pv=${visit.id}`);
}
