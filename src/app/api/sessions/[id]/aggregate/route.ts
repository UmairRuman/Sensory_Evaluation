import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSessionAggregate } from "@/lib/scoring/aggregate";
import { generateProductNarrative } from "@/lib/scoring/narrative";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dbSession = await prisma.session.findUnique({ where: { id }, select: { id: true, evaluationType: true } });
  if (!dbSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const aggregate = await computeSessionAggregate(id);
  const narratives = Object.fromEntries(
    aggregate.products.map((p) => [p.sessionProductId, generateProductNarrative(p, dbSession.evaluationType)])
  );

  return NextResponse.json({ aggregate, narratives });
}
