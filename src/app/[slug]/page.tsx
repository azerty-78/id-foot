import { LogIn } from "lucide-react";
import { notFound } from "next/navigation";
import { CompetitionWorkspace } from "@/components/public/HomeSections";
import {
  PublicFooter,
  PublicHeader,
} from "@/components/public/PublicShell";
import { SecondaryLink } from "@/components/admin/ui";
import { RESERVED_COMPETITION_SLUGS } from "@/lib/competitionSlug";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="home-shell flex flex-col">
      <PublicHeader
        action={
          <SecondaryLink href="/admin/signin" icon={LogIn} size="sm">
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
