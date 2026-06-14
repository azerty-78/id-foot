"use client";

import { Fingerprint, Home, Menu } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminNav, SidebarSignOut } from "@/app/(admin)/AdminNav";

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
  const { data: session } = useSession();
  const initials = getInitials(session?.user?.name, session?.user?.email);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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

      <div className="admin-main lg:ml-[240px]">
        <header className="admin-topbar-sticky flex items-center justify-between px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="btn btn-ghost btn-icon"
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} strokeWidth={2} />
          </button>

          <Link href="/admin/dashboard" className="text-[15px] font-bold tracking-wide">
            <span className="text-navy">ID </span>
            <span className="text-green">FOOT</span>
          </Link>

          <span className="user-avatar" aria-hidden>
            {initials}
          </span>
        </header>

        <div className="admin-content-area">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
