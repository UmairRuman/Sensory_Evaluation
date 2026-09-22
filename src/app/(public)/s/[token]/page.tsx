import { prisma } from "@/lib/prisma";
import { JoinForm } from "@/components/panelist/join-form";
import { ClosedNotice } from "@/components/panelist/closed-notice";
import { BrandMark } from "@/components/host/brand-mark";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const session = await prisma.session.findUnique({
    where: { publicToken: token },
    include: { category: true, sessionProducts: { include: { product: true, samples: true } } },
  });

  if (!session) {
    return <ClosedNotice title="Link not found" message="This scoring link isn't valid. Please check with your host." />;
  }
  if (session.status === "DRAFT") {
    return <ClosedNotice title="Not yet open" message="This session hasn't been published yet. Please check back shortly." />;
  }
  if (session.status === "CLOSED") {
    return <ClosedNotice title="Session closed" message="This session is no longer accepting submissions. Thank you for your interest." />;
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="hero-surface px-5 pb-16 pt-10 text-center">
        <div className="mx-auto flex w-fit flex-col items-center">
          <BrandMark size="sm" />
          <p className="mt-3 font-[family-name:var(--font-display)] text-[10px] font-medium uppercase tracking-[0.2em] text-brand-accent-soft">
            Dawn Foods Corp. Ltd. — Sensory Panel
          </p>
        </div>
        <h1 className="mx-auto mt-2 max-w-sm font-[family-name:var(--font-display)] text-xl font-semibold text-text-on-brand">
          {session.name}
        </h1>
        <p className="mt-1 text-sm text-text-on-brand/75">
          {session.category.title} · {session.sessionProducts.map((sp) => sp.product.name).join(", ")}
        </p>
      </div>

      <div className="mx-auto -mt-10 max-w-md px-5 pb-10">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-raised p-6 shadow-lg">
          <JoinForm token={token} />
        </div>
      </div>
    </main>
  );
}
