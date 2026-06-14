"use client";

import {
  LayoutDashboard,
  QrCode,
  Shield,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive } from "@/hooks/useAdminBackPath";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/admin/scanner", label: "Scanner", icon: QrCode, highlight: true },
  { href: "/admin/players", label: "Joueurs", icon: Users },
  { href: "/admin/teams", label: "Équipes", icon: Shield },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav lg:hidden" aria-label="Navigation principale">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-scan ${active ? "mobile-bottom-nav-scan--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="mobile-bottom-nav-scan-icon" aria-hidden>
                <Icon size={22} strokeWidth={2.25} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-bottom-nav-item ${active ? "mobile-bottom-nav-item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={2} aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
