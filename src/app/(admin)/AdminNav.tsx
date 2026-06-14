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
import { isNavItemActive } from "@/hooks/useAdminBackPath";

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
  collapsed = false,
  className = "",
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  className?: string;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""} ${className}`}
    >
      <Icon strokeWidth={2} />
      <span className="sidebar-nav-text">{item.label}</span>
    </Link>
  );
}

export function AdminNav({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return isNavItemActive(pathname, href);
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
          collapsed={collapsed}
        />
      ))}

      <p className="sidebar-nav-label mt-2">Outils</p>
      {toolsNav.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          onNavigate={onNavigate}
          collapsed={collapsed}
          className={item.href === "/admin/scanner" ? "sidebar-nav-item-scanner" : undefined}
        />
      ))}
    </nav>
  );
}

export function SidebarSignOut({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <Link
      href="/admin/signout"
      onClick={onNavigate}
      title={collapsed ? "Déconnexion" : undefined}
      className="sidebar-nav-item sidebar-signout"
    >
      <LogOut strokeWidth={2} />
      <span className="sidebar-nav-text">Déconnexion</span>
    </Link>
  );
}
