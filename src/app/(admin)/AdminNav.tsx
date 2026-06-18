"use client";

import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getSidebarNavForUser,
  isNavItemActive,
  type AdminNavVariant,
} from "@/lib/adminNav";
import type { UserRole } from "@prisma/client";

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
  collapsed = false,
  variant = "default",
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  variant?: AdminNavVariant;
}) {
  const isScanner = variant === "scanner";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={[
        "sidebar-nav-item",
        isScanner ? "sidebar-nav-item-scanner" : "",
        isScanner && isActive ? "sidebar-nav-item-scanner-active" : "",
        !isScanner && isActive ? "sidebar-nav-item-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon strokeWidth={2} />
      <span className="sidebar-nav-text">{label}</span>
    </Link>
  );
}

export function AdminNav({
  onNavigate,
  collapsed = false,
  role,
  scanOnly = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  role: UserRole;
  scanOnly?: boolean;
}) {
  const pathname = usePathname();
  const { main, tools, scanOnlyMode } = getSidebarNavForUser(role, scanOnly);

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto py-2">
      {!scanOnlyMode ? (
        <>
          <p className="sidebar-nav-label">Navigation</p>
          {main.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isNavItemActive(pathname, item.href)}
              onNavigate={onNavigate}
              collapsed={collapsed}
            />
          ))}
          <p className="sidebar-nav-label mt-2">Outils</p>
        </>
      ) : (
        <p className="sidebar-nav-label">Accès contrôle</p>
      )}

      {tools.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={isNavItemActive(pathname, item.href)}
          onNavigate={onNavigate}
          collapsed={collapsed}
          variant={item.variant ?? "default"}
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
