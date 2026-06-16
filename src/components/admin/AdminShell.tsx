"use client";

import {
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { AdminNav, SidebarSignOut } from "@/app/(admin)/AdminNav";
import { AdminBackButton } from "@/components/admin/AdminBackButton";
import { InactiveSessionGuard } from "@/components/admin/InactiveSessionGuard";
import { MobileBottomNav } from "@/components/admin/MobileBottomNav";
import { AppLogo } from "@/components/brand/AppLogo";
import { useAdminBackPath } from "@/hooks/useAdminBackPath";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useHistoryOverlay } from "@/hooks/useHistoryOverlay";
import { getAdminPageTitle, getMobileTopbarBrand } from "@/lib/adminNav";
import { getPlayerCardBrandLabel } from "@/lib/playerCardBrand";
import type { AuthUser } from "@/lib/auth/scope";

type AdminShellCompetition = {
  id: string;
  nom: string;
  slug: string;
  image: string | null;
  abbreviation: string;
  fullControl: boolean;
};

const SIDEBAR_COLLAPSED_KEY = "id-foot-sidebar-collapsed";
const SIDEBAR_COLLAPSED_EVENT = "id-foot-sidebar-collapsed-change";

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

function subscribeSidebarCollapsed(onStoreChange: () => void): () => void {
  const onChange = () => onStoreChange();
  window.addEventListener("storage", onChange);
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onChange);
  };
}

export function AdminShell({
  children,
  user,
  competition,
}: {
  children: React.ReactNode;
  user: AuthUser;
  competition: AdminShellCompetition | null;
}) {
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    readSidebarCollapsed,
    () => false,
  );
  const pathname = usePathname();
  const menuOpen = menuOpenPath === pathname;
  const isScannerPage = pathname === "/admin/scanner" || pathname.startsWith("/admin/scanner/");
  const backPath = useAdminBackPath();
  const initials = getInitials(user.name, user.email);
  const topbarBrand = getMobileTopbarBrand(pathname);
  const pageTitle = getAdminPageTitle(pathname);
  const TopbarIcon = topbarBrand.icon;
  const brandLogoSrc = competition?.image ?? null;
  const brandLabel = getPlayerCardBrandLabel(competition);
  const brandLogoAlt = competition?.nom ?? brandLabel;
  const brandLogoLabel = competition?.nom ?? brandLabel;
  const showIdFootBrand = brandLabel === "ID FOOT";

  const openMenu = useCallback(() => setMenuOpenPath(pathname), [pathname]);
  const closeMenu = useCallback(() => setMenuOpenPath(null), []);

  const toggleSidebarCollapsed = useCallback(() => {
    const next = !readSidebarCollapsed();
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
  }, []);

  useHistoryOverlay(menuOpen, closeMenu, "admin-sidebar");
  useBodyScrollLock(menuOpen);

  return (
    <div
      className={`admin-layout ${sidebarCollapsed ? "admin-layout--sidebar-collapsed" : ""}`}
    >
      <InactiveSessionGuard />
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
            title={brandLogoLabel}
          >
            <AppLogo
              size="sm"
              src={brandLogoSrc}
              alt={brandLogoAlt}
              className="sidebar-brand-logo rounded-md"
            />
            <span className="sidebar-brand-text hidden min-[380px]:inline">
              {showIdFootBrand ? (
                <>
                  <span className="sidebar-brand-id">ID </span>
                  <span className="sidebar-brand-foot">FOOT</span>
                </>
              ) : (
                <span className="sidebar-brand-foot">{brandLabel}</span>
              )}
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
          {user.email && (
            <Link
              href="/admin/profil"
              onClick={closeMenu}
              className="sidebar-user mb-3 flex items-center gap-2 px-3 transition hover:opacity-90"
            >
              <span className="user-avatar">{initials}</span>
              <div className="min-w-0">
                <p className="sidebar-user-email truncate text-[11px] font-semibold text-white/80">
                  {user.name}
                </p>
                <p className="sidebar-user-email min-w-0 truncate text-[11px] text-white/45">
                  {user.email}
                </p>
                {competition ? (
                  <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-green/90">
                    {competition.nom}
                  </p>
                ) : null}
              </div>
            </Link>
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
            href="/admin/profil"
            className="admin-topbar-logo touch-target"
            aria-label="Mon profil"
          >
            <AppLogo
              size="sm"
              src={brandLogoSrc}
              alt={brandLogoAlt}
              className="admin-topbar-logo-image"
            />
          </Link>
        </header>

        <header className="admin-desktop-bar">
          <div className="min-w-0">
            <h1 className="admin-desktop-bar-title">{pageTitle}</h1>
            {competition ? (
              <p className="admin-desktop-bar-subtitle truncate">
                {competition.nom} · {competition.slug}
              </p>
            ) : null}
          </div>
        </header>

        <div className={`admin-content-area ${isScannerPage ? "admin-content-area--scanner" : ""}`}>
          <div
            key={pathname}
            className={`admin-page-view mx-auto max-w-7xl ${isScannerPage ? "h-full max-w-none" : ""}`}
          >
            {children}
          </div>
        </div>

        {!isScannerPage ? <MobileBottomNav role={user.role} /> : null}
      </div>
    </div>
  );
}
