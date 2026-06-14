import Link from "next/link";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-shell flex min-h-screen">
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/10 bg-gradient-to-b from-brand to-brand-dark text-white shadow-[20px_0_60px_rgba(26,71,42,0.18)]">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/admin/dashboard" className="block">
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
        </div>

        <AdminNav />

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <Link
            href="/api/auth/signout"
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
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Déconnexion
          </Link>
        </div>
      </aside>

      <main className="ml-64 min-h-screen flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
