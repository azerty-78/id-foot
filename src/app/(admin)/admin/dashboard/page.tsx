import type { ReactNode } from "react";
import Link from "next/link";
import { AdminCard, PageHeader } from "@/components/admin/ui";

type Competition = { id: string };
type Equipe = { id: string };
type Joueur = { id: string; photo: string | null };

type StatCard = {
  label: string;
  value: number;
  hint: string;
  gradient: string;
  iconBg: string;
  icon: ReactNode;
  href: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Échec du chargement : ${path}`);
  }

  return res.json() as Promise<T>;
}

export default async function DashboardPage() {
  const [competitions, equipes, joueurs] = await Promise.all([
    fetchJson<Competition[]>("/api/competitions"),
    fetchJson<Equipe[]>("/api/teams"),
    fetchJson<Joueur[]>("/api/players"),
  ]);

  const joueursSansPhoto = joueurs.filter((joueur) => joueur.photo === null).length;

  const stats: StatCard[] = [
    {
      label: "Compétitions",
      value: competitions.length,
      hint: "Tournois actifs",
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-100 text-emerald-700",
      href: "/admin/competitions",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
        </svg>
      ),
    },
    {
      label: "Équipes",
      value: equipes.length,
      hint: "Clubs enregistrés",
      gradient: "from-sky-500/15 to-sky-500/5",
      iconBg: "bg-sky-100 text-sky-700",
      href: "/admin/teams",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      label: "Joueurs",
      value: joueurs.length,
      hint: "Licences actives",
      gradient: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-100 text-amber-700",
      href: "/admin/players",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Sans photo",
      value: joueursSansPhoto,
      hint: "Profils incomplets",
      gradient: "from-rose-500/15 to-rose-500/5",
      iconBg: "bg-rose-100 text-rose-700",
      href: "/admin/players",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble du système d'identification des joueurs."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <AdminCard
              className={`group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${stat.gradient} bg-gradient-to-br`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{stat.hint}</p>
                </div>
                <div className={`rounded-2xl p-3 ${stat.iconBg}`}>{stat.icon}</div>
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
