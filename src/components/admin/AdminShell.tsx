"use client";

import { Fingerprint, Home, Menu, QrCode } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { AdminNav, SidebarSignOut } from "@/app/(admin)/AdminNav";
import { AdminBackButton } from "@/components/admin/AdminBackButton";
import { MobileBottomNav } from "@/components/admin/MobileBottomNav";
import { useAdminBackPath } from "@/hooks/useAdminBackPath";
import { useHistoryOverlay } from "@/hooks/useHistoryOverlay";
import { brandAssets } from "@/lib/brand";

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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isScannerPage = pathname === "/admin/scanner" || pathname.startsWith("/admin/scanner/");
  const backPath = useAdminBackPath();
  const { data: session } = useSession();
  const initials = getInitials(session?.user?.name, session?.user?.email);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useHistoryOverlay(menuOpen, closeMenu, "admin-sidebar");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="admin-layout">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[rgba(13,27,42,0.5)] lg:hidden"
          aria-label="Fermer le menu"
          onClick={closeMenu}
        />
      )}

      <aside
        className={`sidebar fixed left-0 top-0 z-50 flex h-screen flex-col text-white transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sidebar-brand">
          <Link
            href="/admin/dashboard"
            onClick={closeMenu}
            className="flex min-w-0 flex-1 items-center gap-[10px]"
          >
            <span className="sidebar-brand-icon">
              <Fingerprint size={18} strokeWidth={2.5} />
            </span>
            <span className="sidebar-brand-text">
              <span className="sidebar-brand-id">ID </span>
              <span className="sidebar-brand-foot">FOOT</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="modal-close text-white/70 lg:hidden"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <AdminNav onNavigate={closeMenu} />

        <div className="mt-auto border-t border-white/[0.08] px-4 py-4">
          {session?.user?.email && (
            <div className="mb-3 flex items-center gap-2 px-3">
              <span className="user-avatar">{initials}</span>
              <p className="min-w-0 truncate text-[11px] text-white/45">
                {session.user.email}
              </p>
            </div>
          )}

          <SidebarSignOut onNavigate={closeMenu} />

          <Link
            href="/"
            onClick={closeMenu}
            className="sidebar-nav-item mt-1"
          >
            <Home strokeWidth={2} size={16} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </aside>

      <div className={`admin-main lg:ml-[240px] ${isScannerPage ? "admin-main--scanner" : ""}`}>
        <header className="admin-topbar-sticky flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 lg:hidden">
          {backPath ? (
            <AdminBackButton
              className={isScannerPage ? "admin-back-btn--on-dark" : ""}
            />
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`btn btn-ghost btn-icon touch-target ${
                isScannerPage ? "admin-topbar-btn--on-dark" : ""
              }`}
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} strokeWidth={2} />
            </button>
          )}

          {isScannerPage ? (
            <Link href="/admin/scanner" className="scanner-topbar-brand flex items-center gap-1.5 text-[14px] font-bold tracking-wide">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green/20 text-green">
                <QrCode size={14} strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-white">Scan </span>
              <span className="text-green">QR</span>
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="text-[15px] font-bold tracking-wide">
              <span className="text-navy">ID </span>
              <span className="text-green">FOOT</span>
            </Link>
          )}

          <Link
            href="/admin/dashboard"
            className="admin-topbar-logo"
            aria-label="ID FOOT"
          >
            <Image
              src={brandAssets.logo}
              alt=""
              width={140}
              height={48}
              priority
              unoptimized
              className="admin-topbar-logo-image"
            />
          </Link>
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
