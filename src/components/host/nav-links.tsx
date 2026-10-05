"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/sessions", label: "Sessions" },
];
const ADMIN_LINKS = [{ href: "/admin/products", label: "Manage Products" }];

export function NavLinks({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...BASE_LINKS, ...ADMIN_LINKS] : BASE_LINKS;

  return (
    <div className="flex items-center gap-1">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "text-brand-primary-strong" : "text-text-muted hover:text-brand-primary-strong"
            }`}
          >
            {active && <span className="absolute inset-0 rounded-full bg-brand-primary-soft" />}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
