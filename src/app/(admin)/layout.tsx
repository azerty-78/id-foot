import Link from "next/link";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col bg-[#1a472a] text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <Link href="/admin/dashboard" className="block">
            <span className="text-lg font-bold tracking-tight">Football ID</span>
            <span className="mt-0.5 block text-xs text-white/60">
              Administration
            </span>
          </Link>
        </div>

        <AdminNav />

        <div className="mt-auto border-t border-white/10 px-3 py-4">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
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

      <main className="ml-60 min-h-screen flex-1 p-8">{children}</main>
    </div>
  );
}
