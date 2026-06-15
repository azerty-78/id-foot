import { LogIn } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { CompetitionWorkspace } from "@/components/public/HomeSections";
import {
  PublicFooter,
  PublicHeader,
} from "@/components/public/PublicShell";
import { SecondaryLink } from "@/components/admin/ui";
import {
  ADMIN_COMPETITION_HOME,
  buildCompetitionSignInHref,
  RESERVED_COMPETITION_SLUGS,
} from "@/lib/competitionSlug";
import { getAuthUser } from "@/lib/auth/server";
import { canAccessCompetition } from "@/lib/auth/scope";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CompetitionPublicPage({ params }: PageProps) {
  const { slug } = await params;

  if (RESERVED_COMPETITION_SLUGS.has(slug)) {
    notFound();
  }

  const competition = await prisma.competition.findUnique({
    where: { slug },
    include: {
      _count: { select: { equipes: true } },
    },
  });

  if (!competition) {
    notFound();
  }

  const user = await getAuthUser();
  if (user && canAccessCompetition(user, competition.id)) {
    redirect(ADMIN_COMPETITION_HOME);
  }

  return (
    <div className="home-shell flex flex-col">
      <PublicHeader
        action={
          <SecondaryLink
            href={buildCompetitionSignInHref(slug)}
            icon={LogIn}
            size="sm"
          >
            Connexion
          </SecondaryLink>
        }
      />

      <main className="home-main flex-1">
        <CompetitionWorkspace
          competitionName={competition.nom}
          competitionYear={competition.annee}
          competitionPlace={competition.lieu}
          competitionImage={competition.image}
          teamCount={competition._count.equipes}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
