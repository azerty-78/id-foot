"use client";

import {
  LayoutDashboard,
  Menu,
  QrCode,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
];

export function MobileBottomNav({
  onOpenMenu,
}: {
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="mobile-bottom-nav lg:hidden" aria-label="Navigation principale">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

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

      <button
        type="button"
        className="mobile-bottom-nav-item"
        onClick={onOpenMenu}
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} strokeWidth={2} aria-hidden />
        <span>Menu</span>
      </button>
    </nav>
  );
}
