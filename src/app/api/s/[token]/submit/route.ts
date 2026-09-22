import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const submitSchema = z.object({
  panelistVisitId: z.string().min(1),
  sampleId: z.string().min(1),
  scores: z.record(z.string(), z.number().int().min(1).max(5)),
  comment: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const { panelistVisitId, sampleId, scores, comment } = parsed.data;

  const session = await prisma.session.findUnique({
    where: { publicToken: token },
    include: {
      sessionAttributes: { where: { enabled: true }, select: { attributeId: true } },
    },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.status !== "ACTIVE") {
    return NextResponse.json({ error: "This session is not accepting submissions." }, { status: 403 });
  }

  const visit = await prisma.panelistVisit.findUnique({ where: { id: panelistVisitId } });
  if (!visit || visit.sessionId !== session.id) {
    return NextResponse.json({ error: "Invalid panelist session." }, { status: 403 });
  }

  const sample = await prisma.sample.findUnique({
    where: { id: sampleId },
    include: { sessionProduct: true },
  });
  if (!sample || sample.sessionProduct.sessionId !== session.id) {
    return NextResponse.json({ error: "Invalid sample." }, { status: 403 });
  }

  const enabledAttributeIds = new Set(session.sessionAttributes.map((sa) => sa.attributeId));
  const submittedAttributeIds = Object.keys(scores);
  const allEnabled = submittedAttributeIds.every((id) => enabledAttributeIds.has(id));
  const allPresent = session.sessionAttributes.every((sa) => sa.attributeId in scores);
  if (!allEnabled || !allPresent) {
    return NextResponse.json({ error: "All mandatory parameters must be scored." }, { status: 400 });
  }

  const existing = await prisma.submission.findUnique({
    where: { panelistVisitId_sampleId: { panelistVisitId, sampleId } },
  });
  if (existing) {
    return NextResponse.json({ error: "This sample was already scored in this visit." }, { status: 409 });
  }

  await prisma.submission.create({
    data: {
      panelistVisitId,
      sampleId,
      comment: comment || null,
      scores: {
        create: submittedAttributeIds.map((attributeId) => ({ attributeId, value: scores[attributeId] })),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
