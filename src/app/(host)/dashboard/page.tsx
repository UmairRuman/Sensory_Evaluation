import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [activeCount, totalCount, panelistCount, recentSessions] = await Promise.all([
    prisma.session.count({ where: { status: "ACTIVE" } }),
    prisma.session.count(),
    prisma.panelistVisit.count(),
    prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { category: true, sessionProducts: true },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="hero-surface relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.2em] text-brand-accent-soft">
            Commercial Quality Assurance
          </p>
          <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-[2.1rem] font-semibold leading-[1.12] text-text-on-brand sm:text-[2.75rem]">
            Sensory Evaluation, digitized end to end.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-on-brand/80">
            Configure a session against the standard masterfile, hand panelists a link or QR code, and watch
            scores, charts, and a verdict assemble themselves in real time.
          </p>

          <div className="mt-8 flex flex-wrap gap-8 sm:gap-12">
            <Stat value={activeCount} label="Active sessions" />
            <Stat value={totalCount} label="Total sessions" />
            <Stat value={panelistCount} label="Panelist visits" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <ActionCard
            href="/sessions/new"
            icon="＋"
            title="Create New Session"
            description="Select a product, its sensory parameter masterfile, and publish a scoring link + QR code for panelists."
          />
          <ActionCard
            href="/sessions"
            icon="⌕"
            title="View Older Sessions"
            description="Search and filter previously conducted sessions — scores, charts, conclusions, and raw responses."
          />
        </div>

        <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-text">
              Recent sessions
            </h2>
            {recentSessions.length > 0 && (
              <Link href="/sessions" className="text-xs font-semibold text-brand-primary hover:underline">
                View all
              </Link>
            )}
          </div>
          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
              <span className="text-3xl">🍽️</span>
              <p className="text-sm text-text-muted">No sessions yet — create your first one to get started.</p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {recentSessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sessions/${s.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-brand-primary-soft/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text">{s.name}</span>
                      <span className="text-xs text-text-muted">
                        {s.category.title} · {s.sessionProducts.length} product
                        {s.sessionProducts.length === 1 ? "" : "s"}
                      </span>
                    </span>
                    <StatusBadge status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-text-on-brand">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-text-on-brand/70">{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary-soft text-lg font-semibold text-brand-primary-strong transition-colors group-hover:bg-brand-primary group-hover:text-text-on-brand">
        {icon}
      </span>
      <p className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-primary-strong">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary opacity-0 transition-opacity group-hover:opacity-100">
        Get started →
      </span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-surface-sunken text-text-muted",
    ACTIVE: "bg-status-target/15 text-status-target",
    CLOSED: "bg-border text-text-muted",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
