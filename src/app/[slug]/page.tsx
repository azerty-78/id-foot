import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { CompetitionWorkspace } from "@/components/public/HomeSections";
import {
  PublicFooter,
  PublicHeader,
  type CompetitionBranding,
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (RESERVED_COMPETITION_SLUGS.has(slug)) {
    return { title: "Compétition introuvable" };
  }

  const competition = await prisma.competition.findUnique({
    where: { slug },
    select: { nom: true, abbreviation: true, annee: true, lieu: true, image: true },
  });

  if (!competition) {
    return { title: "Compétition introuvable" };
  }

  const title = `${competition.nom} (${competition.abbreviation})`;
  const description = `Plateforme officielle de gestion des licences pour la compétition ${competition.nom}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: competition.abbreviation,
    },
  };
}

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

  const branding: CompetitionBranding = {
    nom: competition.nom,
    abbreviation: competition.abbreviation,
    slug: competition.slug,
    image: competition.image,
  };

  return (
    <div className="home-shell flex flex-col">
      <PublicHeader
        branding={branding}
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
          competitionAbbreviation={competition.abbreviation}
          competitionYear={competition.annee}
          competitionPlace={competition.lieu}
          competitionImage={competition.image}
          teamCount={competition._count.equipes}
          signInHref={buildCompetitionSignInHref(slug)}
        />
      </main>

      <PublicFooter branding={branding} />
    </div>
  );
}
