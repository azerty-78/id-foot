import { CameraOff, Shield, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader, StatCard, type StatCardTone } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

type StatItem = {
  label: string;
  value: number;
  delta: string;
  href: string;
  icon: LucideIcon;
  tone?: StatCardTone;
};

export default async function DashboardPage() {
  const [competitionsCount, equipesCount, joueurs] = await Promise.all([
    prisma.competition.count(),
    prisma.equipe.count(),
    prisma.joueur.findMany({ select: { id: true, photo: true } }),
  ]);

  const joueursSansPhoto = joueurs.filter((joueur) => joueur.photo === null).length;

  const stats: StatItem[] = [
    {
      label: "Compétitions",
      value: competitionsCount,
      delta: "Tournois actifs",
      href: "/admin/competitions",
      icon: Trophy,
    },
    {
      label: "Équipes",
      value: equipesCount,
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
