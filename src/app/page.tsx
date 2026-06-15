import { Plus } from "lucide-react";
import {
  CompetitionsGrid,
  HowItWorksSection,
} from "@/components/public/HomeSections";
import {
  PublicFooter,
  PublicHeader,
  PublicHeaderActionLink,
} from "@/components/public/PublicShell";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const competitions = await prisma.competition.findMany({
    orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { equipes: true } },
    },
  });

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

        <section className="home-section" aria-labelledby="competitions-title">
          <div className="home-section-header">
            <p className="text-section-label">Compétitions</p>
            <h2 id="competitions-title" className="text-h2">
              Tournois sur ID FOOT
            </h2>
            <p className="text-body home-section-lead">
              Accédez à l&apos;espace dédié de chaque compétition pour gérer
              clubs, joueurs et scanner QR.
            </p>
          </div>
          <CompetitionsGrid competitions={competitions} />
        </section>

        <HowItWorksSection />
      </main>

      <PublicFooter />
    </div>
  );
}
