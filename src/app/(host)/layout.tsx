import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavLinks } from "@/components/host/nav-links";
import { UserMenu } from "@/components/host/user-menu";
import { BrandMark } from "@/components/host/brand-mark";

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Defense-in-depth: proxy.ts already gates these routes, but this check makes the host
  // section safe even if proxy doesn't run (e.g. an edge/host environment that doesn't yet
  // support Next.js 16's proxy.ts convention).
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface-raised/90 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <BrandMark />
            <span className="flex flex-col leading-tight">
              <span className="font-[family-name:var(--font-display)] text-[10px] font-medium uppercase tracking-[0.16em] text-brand-accent-strong">
                Dawn Foods Corp. Ltd.
              </span>
              <span className="font-[family-name:var(--font-display)] text-[17px] font-semibold text-brand-primary-strong">
                Sensory Evaluation
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <NavLinks />
            <span className="hidden h-6 w-px bg-border sm:block" />
            <UserMenu name={session?.user?.name} email={session?.user?.email} />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-surface">{children}</main>
    </div>
  );
}
