"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/sessions", label: "Sessions" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {LINKS.map((link) => {
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
