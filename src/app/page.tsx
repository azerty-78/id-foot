import { Plus } from "lucide-react";
import {
  HomeCompetitionsSection,
  type HomeCompetitionItem,
} from "@/components/public/HomeCompetitionsSection";
import { HowItWorksSection } from "@/components/public/HomeSections";
import {
  PublicFooter,
  PublicHeader,
  PublicHeaderActionLink,
} from "@/components/public/PublicShell";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { equipes: true } },
    },
  });

  const competitionItems: HomeCompetitionItem[] = competitions.map(
    (competition) => ({
      id: competition.id,
      nom: competition.nom,
      slug: competition.slug,
      annee: competition.annee,
      lieu: competition.lieu,
      image: competition.image,
      createdAt: competition.createdAt.toISOString(),
      _count: competition._count,
    }),
  );

  return (
    <div className="home-shell flex flex-col">
      <PublicHeader
        action={
          <PublicHeaderActionLink href="/creer-competition" icon={Plus}>
            Créer une compétition
          </PublicHeaderActionLink>
        }
      />

      <main className="home-main flex-1">
        <section className="home-landing-hero" aria-labelledby="home-hero-title">
          <div className="home-landing-hero-inner">
            <p className="text-section-label">KOBE Corporation</p>
            <h1 id="home-hero-title" className="text-h1 home-hero-title">
              Licences joueurs & contrôle QR en compétition
            </h1>
            <p className="text-body home-hero-text">
              ID FOOT centralise l&apos;identification des joueurs, la génération
              des cartes licence et le contrôle d&apos;accès par QR code sur le
              terrain. Choisissez une compétition ci-dessous ou créez la vôtre.
            </p>
          </div>
        </section>

        <HomeCompetitionsSection competitions={competitionItems} />

        <HowItWorksSection />
      </main>

      <PublicFooter />
    </div>
  );
}
