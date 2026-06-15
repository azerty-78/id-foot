"use client";

import {
  Home,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { AdminNav, SidebarSignOut } from "@/app/(admin)/AdminNav";
import { AdminBackButton } from "@/components/admin/AdminBackButton";
import { MobileBottomNav } from "@/components/admin/MobileBottomNav";
import { AppLogo } from "@/components/brand/AppLogo";
import { useAdminBackPath } from "@/hooks/useAdminBackPath";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useHistoryOverlay } from "@/hooks/useHistoryOverlay";

const SIDEBAR_COLLAPSED_KEY = "id-foot-sidebar-collapsed";

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "IF";
}

type MobileTopbarBrand = {
  href: string;
  icon: LucideIcon;
  primary: string;
  accent?: string;
};

function getMobileTopbarBrand(pathname: string): MobileTopbarBrand {
  if (pathname.startsWith("/admin/scanner")) {
    return { href: "/admin/scanner", icon: QrCode, primary: "Scan ", accent: "QR" };
  }
  if (pathname.startsWith("/admin/players")) {
    return { href: "/admin/players", icon: Users, primary: "Joueurs" };
  }
  if (pathname.startsWith("/admin/teams")) {
    return { href: "/admin/teams", icon: Shield, primary: "Équipes" };
  }
  if (pathname.startsWith("/admin/competitions")) {
    return { href: "/admin/competitions", icon: Trophy, primary: "Compétitions" };
  }
  return { href: "/admin/dashboard", icon: LayoutDashboard, primary: "Dashboard" };
}

function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/scanner")) return "Scanner QR";
  if (pathname === "/admin/players/cards") return "Cartes licences";
  if (pathname === "/admin/players/new") return "Ajouter un joueur";
  if (/^\/admin\/players\/[^/]+\/edit\/?$/.test(pathname)) return "Modifier le joueur";
  if (/^\/admin\/players\/[^/]+\/?$/.test(pathname)) return "Fiche joueur";
  if (pathname.startsWith("/admin/players")) return "Joueurs";
  if (pathname.startsWith("/admin/teams")) return "Équipes";
  if (pathname.startsWith("/admin/competitions")) return "Compétitions";
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  return "Administration";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const menuOpen = menuOpenPath === pathname;
  const isScannerPage = pathname === "/admin/scanner" || pathname.startsWith("/admin/scanner/");
  const backPath = useAdminBackPath();
  const { data: session } = useSession();
  const initials = getInitials(session?.user?.name, session?.user?.email);
  const topbarBrand = getMobileTopbarBrand(pathname);
  const pageTitle = getAdminPageTitle(pathname);
  const TopbarIcon = topbarBrand.icon;

  const openMenu = useCallback(() => setMenuOpenPath(pathname), [pathname]);
  const closeMenu = useCallback(() => setMenuOpenPath(null), []);

  useEffect(() => {
    setSidebarCollapsed(readSidebarCollapsed());
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useHistoryOverlay(menuOpen, closeMenu, "admin-sidebar");
  useBodyScrollLock(menuOpen);

  return (
    <div
      className={`admin-layout ${sidebarCollapsed ? "admin-layout--sidebar-collapsed" : ""}`}
    >
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[rgba(13,27,42,0.5)] lg:hidden"
          aria-label="Fermer le menu"
          onClick={closeMenu}
        />
      )}

      <aside
        className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""} fixed left-0 top-0 z-50 flex h-screen flex-col text-white transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sidebar-brand">
          <Link
            href="/admin/dashboard"
            onClick={closeMenu}
            className="sidebar-brand-link flex min-w-0 flex-1 items-center gap-[10px]"
            title="ID FOOT"
          >
            <AppLogo size="sm" className="sidebar-brand-logo rounded-md" />
            <span className="sidebar-brand-text hidden min-[380px]:inline">
              <span className="sidebar-brand-id">ID </span>
              <span className="sidebar-brand-foot">FOOT</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="sidebar-toggle hidden lg:inline-flex"
            aria-label={sidebarCollapsed ? "Ouvrir la barre latérale" : "Réduire la barre latérale"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={18} strokeWidth={2} />
            ) : (
              <PanelLeftClose size={18} strokeWidth={2} />
            )}
          </button>
        </div>

        <AdminNav onNavigate={closeMenu} collapsed={sidebarCollapsed} />

        <div className="sidebar-footer mt-auto border-t border-white/[0.08] px-4 py-4">
          {session?.user?.email && (
            <div className="sidebar-user mb-3 flex items-center gap-2 px-3">
              <span className="user-avatar">{initials}</span>
              <p className="sidebar-user-email min-w-0 truncate text-[11px] text-white/45">
                {session.user.email}
              </p>
            </div>
          )}

          <SidebarSignOut onNavigate={closeMenu} collapsed={sidebarCollapsed} />

          <Link
            href="/"
            onClick={closeMenu}
            className="sidebar-nav-item mt-1"
            title={sidebarCollapsed ? "Retour à l'accueil" : undefined}
          >
            <Home strokeWidth={2} size={16} />
            <span className="sidebar-nav-text">Retour à l&apos;accueil</span>
          </Link>
        </div>
      </aside>

      <div className={`admin-main ${isScannerPage ? "admin-main--scanner" : ""}`}>
        <header className="admin-topbar-sticky flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 lg:hidden">
          {backPath ? (
            <AdminBackButton className="admin-back-btn--on-dark" />
          ) : (
            <button
              type="button"
              onClick={openMenu}
              className="btn btn-ghost btn-icon touch-target admin-topbar-btn--on-dark"
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} strokeWidth={2} />
            </button>
          )}

          <Link
            href={topbarBrand.href}
            className="admin-topbar-brand flex items-center gap-1.5 text-[14px] font-bold tracking-wide"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green/20 text-green">
              <TopbarIcon size={14} strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-white">{topbarBrand.primary}</span>
            {topbarBrand.accent && (
              <span className="text-green">{topbarBrand.accent}</span>
            )}
          </Link>

          <Link
            href="/admin/dashboard"
            className="admin-topbar-logo touch-target"
            aria-label="ID FOOT"
          >
            <AppLogo size="sm" className="admin-topbar-logo-image" />
          </Link>
        </header>

        <header className="admin-desktop-bar">
          <h1 className="admin-desktop-bar-title">{pageTitle}</h1>
        </header>

        <div className={`admin-content-area ${isScannerPage ? "admin-content-area--scanner" : ""}`}>
          <div
            key={pathname}
            className={`admin-page-view mx-auto max-w-7xl ${isScannerPage ? "h-full max-w-none" : ""}`}
          >
            {children}
          </div>
        </div>

        <MobileBottomNav />
      </div>
    </div>
  );
}
