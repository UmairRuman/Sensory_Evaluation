import { signOut } from "@/lib/auth";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ name, email }: { name?: string | null; email?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2.5 sm:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-text-on-brand">
          {initials(name, email)}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium text-text">{name}</p>
          <p className="text-xs text-text-muted">{email}</p>
        </div>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-brand-primary/40 hover:bg-brand-primary-soft hover:text-brand-primary-strong">
          Sign out
        </button>
      </form>
    </div>
  );
}
