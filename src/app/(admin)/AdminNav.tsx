"use client";

import {
  LayoutDashboard,
  LogOut,
  QrCode,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const mainNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/competitions", label: "Compétitions", icon: Trophy },
  { href: "/admin/teams", label: "Équipes", icon: Shield },
  { href: "/admin/players", label: "Joueurs", icon: Users },
];

const toolsNav: NavItem[] = [
  { href: "/admin/scanner", label: "Scanner QR", icon: QrCode },
];

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`}
    >
      <Icon strokeWidth={2} />
      {item.label}
    </Link>
  );
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto py-2">
      <p className="sidebar-nav-label">Navigation</p>
      {mainNav.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          onNavigate={onNavigate}
        />
      ))}

      <p className="sidebar-nav-label mt-2">Outils</p>
      {toolsNav.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

export function SidebarSignOut({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin/signout"
      onClick={onNavigate}
      className="sidebar-nav-item sidebar-signout"
    >
      <LogOut strokeWidth={2} />
      Déconnexion
    </Link>
  );
}
