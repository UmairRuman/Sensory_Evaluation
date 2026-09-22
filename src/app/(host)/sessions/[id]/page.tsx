import { notFound } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { computeSessionAggregate } from "@/lib/scoring/aggregate";
import { generateProductNarrative } from "@/lib/scoring/narrative";
import { SessionDashboard } from "@/components/session-dashboard/session-dashboard";
import { ShareBlock } from "@/components/session-dashboard/share-block";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: true,
      sessionProducts: { include: { product: true, samples: true } },
    },
  });
  if (!session) notFound();

  const hdrs = await headers();
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host");
  const joinUrl = `${protocol}://${host}/s/${session.publicToken}`;
  const qrDataUrl = await QRCode.toDataURL(joinUrl, { margin: 1, width: 220 });

  const aggregate = await computeSessionAggregate(id);
  const narratives = Object.fromEntries(
    aggregate.products.map((p) => [p.sessionProductId, generateProductNarrative(p, session.evaluationType)])
  );

  const statusStyles: Record<string, string> = {
    DRAFT: "bg-surface-sunken text-text-muted",
    ACTIVE: "bg-status-target/15 text-status-target",
    CLOSED: "bg-border text-text-muted",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.16em] text-brand-accent">
            {session.category.title} · {session.evaluationType.replace(/_/g, " ")}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-[1.75rem] font-semibold text-brand-primary-strong">
            {session.name}
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Hosted by {session.createdBy?.name ?? "—"} ·{" "}
            {session.createdAt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
            {session.region ? ` · ${session.region}` : ""}
            {session.entity ? ` · ${session.entity}` : ""}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[session.status]}`}>
          {session.status}
        </span>
      </div>

      {session.status !== "CLOSED" && (
        <ShareBlock joinUrl={joinUrl} qrDataUrl={qrDataUrl} joinCode={session.joinCode} />
      )}

      <div className="mt-6">
        <SessionDashboard
          sessionId={session.id}
          status={session.status}
          initialData={{ aggregate, narratives }}
        />
      </div>
    </div>
  );
}
