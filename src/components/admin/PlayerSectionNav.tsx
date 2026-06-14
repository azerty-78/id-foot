"use client";

import { CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/players", label: "Liste", icon: Users },
  { href: "/admin/players/cards", label: "Cartes licences", icon: CreditCard },
] as const;

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/admin/players/cards") {
    return pathname.startsWith(href);
  }

  return (
    pathname === "/admin/players" ||
    (pathname.startsWith("/admin/players/") && !pathname.startsWith("/admin/players/cards"))
  );
}

export function PlayerSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="player-section-nav" aria-label="Navigation joueurs">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isTabActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={`player-section-nav-item${active ? " player-section-nav-item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} strokeWidth={2.25} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
