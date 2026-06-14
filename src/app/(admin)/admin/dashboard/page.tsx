import { CameraOff, Shield, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader, StatCard, type StatCardTone } from "@/components/admin/ui";

type Competition = { id: string };
type Equipe = { id: string };
type Joueur = { id: string; photo: string | null };

type StatItem = {
  label: string;
  value: number;
  delta: string;
  href: string;
  icon: LucideIcon;
  tone?: StatCardTone;
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

  const stats: StatItem[] = [
    {
      label: "Compétitions",
      value: competitions.length,
      delta: "Tournois actifs",
      href: "/admin/competitions",
      icon: Trophy,
    },
    {
      label: "Équipes",
      value: equipes.length,
      delta: "Clubs enregistrés",
      href: "/admin/teams",
      icon: Shield,
    },
    {
      label: "Joueurs",
      value: joueurs.length,
      delta: "Licences actives",
      href: "/admin/players",
      icon: Users,
    },
    {
      label: "Sans photo",
      value: joueursSansPhoto,
      delta: "Profils incomplets",
      href: "/admin/players",
      icon: CameraOff,
      tone: "warning",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble du système d'identification des joueurs."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block transition hover:-translate-y-0.5">
            <StatCard
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
              icon={stat.icon}
              tone={stat.tone}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
