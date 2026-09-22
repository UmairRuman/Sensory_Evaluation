import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listCategories } from "@/lib/masterfile/queries";
import type { Prisma, SessionStatus } from "@prisma/client";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const params = await searchParams;
  const categories = await listCategories();

  const where: Prisma.SessionWhereInput = {};
  if (params.q) {
    where.name = { contains: params.q, mode: "insensitive" };
  }
  if (params.category) {
    where.categoryId = params.category;
  }
  if (params.status) {
    where.status = params.status as SessionStatus;
  }

  const sessions = await prisma.session.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true, createdBy: true, sessionProducts: { include: { samples: true } } },
    take: 50,
  });

  const hasFilters = Boolean(params.q || params.category || params.status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.16em] text-brand-accent">
            Session archive
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-primary-strong">
            Sessions
          </h1>
        </div>
        <Link
          href="/sessions/new"
          className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-on-brand shadow-sm transition-colors hover:bg-brand-primary-strong"
        >
          + New Session
        </Link>
      </div>

      <form
        method="GET"
        className="mb-6 flex flex-wrap items-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface-raised p-2.5 shadow-sm"
      >
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search by session name…"
            className="w-full rounded-[var(--radius-md)] border border-transparent bg-surface-sunken py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-brand-primary/40 focus:bg-surface-raised"
          />
        </div>
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="rounded-[var(--radius-md)] border border-transparent bg-surface-sunken px-3.5 py-2.5 text-sm outline-none focus:border-brand-primary/40"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-[var(--radius-md)] border border-transparent bg-surface-sunken px-3.5 py-2.5 text-sm outline-none focus:border-brand-primary/40"
        >
          <option value="">Any status</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button
          type="submit"
          className="rounded-[var(--radius-md)] bg-brand-primary-soft px-4 py-2.5 text-sm font-semibold text-brand-primary-strong transition-colors hover:bg-brand-accent-soft"
        >
          Filter
        </button>
        {hasFilters && (
          <Link href="/sessions" className="px-2 text-xs font-medium text-text-muted hover:text-brand-primary-strong">
            Clear
          </Link>
        )}
      </form>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface-raised px-10 py-16 text-center shadow-sm">
          <span className="text-3xl">⌕</span>
          <p className="text-sm text-text-muted">No sessions match these filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-sunken/60 text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Host</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="group border-b border-border last:border-0">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/sessions/${s.id}`}
                      className="font-medium text-text transition-colors group-hover:text-brand-primary-strong"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted">{s.category.title}</td>
                  <td className="px-5 py-3.5 text-text-muted">{s.sessionProducts.length}</td>
                  <td className="px-5 py-3.5 text-text-muted">{s.createdBy?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-text-muted">
                    {s.createdAt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-surface-sunken text-text-muted",
    ACTIVE: "bg-status-target/15 text-status-target",
    CLOSED: "bg-border text-text-muted",
  };
  const dot: Record<string, string> = {
    DRAFT: "bg-text-muted",
    ACTIVE: "bg-status-target",
    CLOSED: "bg-text-muted",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}
