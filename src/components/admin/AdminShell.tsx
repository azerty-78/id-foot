"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminNav } from "@/app/(admin)/AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="admin-shell min-h-screen">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
          aria-label="Ouvrir le menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-black text-gold">
            ID
          </div>
          <span className="text-sm font-bold text-slate-900">Football ID</span>
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-brand"
          aria-label="Accueil"
        >
          Accueil
        </Link>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[min(100vw-3rem,18rem)] flex-col border-r border-white/10 bg-gradient-to-b from-brand to-brand-dark text-white shadow-[20px_0_60px_rgba(26,71,42,0.18)] transition-transform duration-300 lg:w-64 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:px-6 lg:py-6">
          <Link href="/admin/dashboard" className="block" onClick={() => setMenuOpen(false)}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-gold">
                ID
              </div>
              <div>
                <span className="block text-lg font-bold tracking-tight">
                  Football ID
                </span>
                <span className="mt-0.5 block text-xs text-white/60">
                  Administration
                </span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <AdminNav onNavigate={() => setMenuOpen(false)} />

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          {session?.user?.email && (
            <p className="mb-3 truncate px-3 text-xs text-white/50">
              {session.user.email}
            </p>
          )}

          <Link
            href="/admin/signout"
            onClick={() => setMenuOpen(false)}
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Déconnexion
          </Link>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </aside>

      <main className="min-h-screen px-4 py-6 lg:ml-64 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
