import {
  MapPin,
  QrCode,
  Shield,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { PrimaryLink } from "@/components/admin/ui";
import { buildCompetitionSignInHref } from "@/lib/competitionSlug";

export const competitionFeatureCards = [
  {
    title: "Scanner QR",
    text: "Contrôle d'accès rapide en compétition — validez chaque joueur en un scan.",
    href: "/admin/scanner",
    featured: true,
  },
  {
    title: "Joueurs",
    text: "Fiches complètes, photo, téléphone et numéro de maillot.",
    href: "/admin/players",
  },
  {
    title: "Clubs",
    text: "Équipes rattachées aux compétitions avec effectifs.",
    href: "/admin/teams",
  },
  {
    title: "Compétitions",
    text: "Organisation des tournois et saisons.",
    href: "/admin/competitions",
  },
  {
    title: "Cartes licence",
    text: "PDF imprimable et QR code par joueur.",
    href: "/admin/players/new",
  },
];

export const howItWorksSteps = [
  {
    icon: Trophy,
    title: "Créez votre compétition",
    text: "Définissez le nom, l'année, le lieu et l'image de couverture de votre tournoi.",
  },
  {
    icon: Users,
    title: "Inscrivez clubs et joueurs",
    text: "Rattachez les équipes à la compétition et complétez les fiches joueurs avec photo.",
  },
  {
    icon: Shield,
    title: "Générez les cartes licence",
    text: "Exportez les PDF avec QR code unique pour chaque licencié.",
  },
  {
    icon: QrCode,
    title: "Contrôlez à l'entrée",
    text: "Scannez les QR codes sur le terrain pour valider l'accès en quelques secondes.",
  },
];

type CompetitionWorkspaceProps = {
  competitionName: string;
  competitionAbbreviation: string;
  competitionYear: number;
  competitionPlace?: string | null;
  competitionImage?: string | null;
  teamCount?: number;
  signInHref: string;
};

const competitionPublicFeatures: Array<{
  icon: typeof QrCode;
  title: string;
  text: string;
  featured?: boolean;
}> = [
  {
    icon: QrCode,
    title: "Contrôle à l'entrée",
    text: "Validez chaque joueur licencié en un scan QR sur le terrain.",
    featured: true,
  },
  {
    icon: UserRound,
    title: "Fiches joueurs",
    text: "Photo, téléphone, poste et numéro de maillot centralisés.",
  },
  {
    icon: Users,
    title: "Clubs & effectifs",
    text: "Équipes inscrites et effectifs rattachés à la compétition.",
  },
  {
    icon: Shield,
    title: "Cartes licence",
    text: "PDF imprimable avec QR code unique par licencié.",
  },
];

export function CompetitionWorkspace({
  competitionName,
  competitionAbbreviation,
  competitionYear,
  competitionPlace,
  competitionImage,
  teamCount = 0,
  signInHref,
}: CompetitionWorkspaceProps) {
  return (
    <div className="competition-workspace">
      <section
        className={`competition-hero${competitionImage ? " competition-hero--photo" : " competition-hero--empty"}`}
        aria-label={`Compétition ${competitionName}`}
      >
        {competitionImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={competitionImage}
            alt={competitionName}
            className="competition-hero-image"
          />
        ) : (
          <div className="competition-hero-placeholder" aria-hidden>
            <Trophy size={48} />
          </div>
        )}
        <div className="competition-hero-overlay" aria-hidden />

        <div className="competition-hero-content">
          <p className="competition-hero-label">
            {competitionAbbreviation} · {competitionYear}
          </p>
          <h1 className="competition-hero-title">{competitionName}</h1>
          {competitionPlace ? (
            <p className="competition-hero-place">
              <MapPin size={16} aria-hidden />
              <span>{competitionPlace}</span>
            </p>
          ) : null}
          <p className="competition-hero-meta">
            <Users size={15} aria-hidden />
            <span>
              {teamCount} équipe{teamCount > 1 ? "s" : ""} inscrite
              {teamCount > 1 ? "s" : ""}
            </span>
          </p>
        </div>
      </section>

      <section className="competition-intro" aria-labelledby="competition-intro-title">
        <div className="competition-intro-badge" aria-hidden>
          {competitionAbbreviation}
        </div>
        <div className="competition-intro-body">
          <p className="text-section-label">Espace compétition</p>
          <h2 id="competition-intro-title" className="text-h2 competition-intro-title">
            Pour la compétition {competitionName}
          </h2>
          <p className="text-body competition-intro-lead">
            {competitionAbbreviation} centralise l&apos;identification des joueurs,
            la génération des cartes licence et le contrôle d&apos;accès par QR
            code — le tout dédié à votre tournoi.
          </p>
          <div className="competition-intro-actions">
            <PrimaryLink href={signInHref} icon={Shield} className="w-full sm:w-auto">
              Connexion administrateur
            </PrimaryLink>
          </div>
        </div>
      </section>

      <section className="competition-features" aria-labelledby="competition-features-title">
        <div className="competition-features-header">
          <p className="text-section-label">Fonctionnalités</p>
          <h2 id="competition-features-title" className="text-h3">
            Ce que propose {competitionAbbreviation}
          </h2>
        </div>

        <div className="competition-feature-grid">
          {competitionPublicFeatures.map((item) => (
            <article
              key={item.title}
              className={`competition-feature-card${item.featured ? " competition-feature-card--featured" : ""}`}
            >
              {item.featured ? (
                <span className="competition-feature-badge">
                  <QrCode size={12} aria-hidden />
                  Priorité terrain
                </span>
              ) : null}
              <div className="competition-feature-icon" aria-hidden>
                <item.icon size={20} strokeWidth={2} />
              </div>
              <h3 className="text-h3">{item.title}</h3>
              <p className="text-body mt-2">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="home-section" aria-labelledby="how-it-works-title">
      <div className="home-section-header">
        <p className="text-section-label">Fonctionnement</p>
        <h2 id="how-it-works-title" className="text-h2">
          Comment fonctionne ID FOOT ?
        </h2>
        <p className="text-body home-section-lead">
          De la création de la compétition au contrôle à l&apos;entrée du
          terrain, tout est centralisé sur une seule plateforme.
        </p>
      </div>

      <div className="home-steps-grid">
        {howItWorksSteps.map((step, index) => (
          <article key={step.title} className="home-step-card">
            <span className="home-step-index" aria-hidden>
              {index + 1}
            </span>
            <div className="home-step-icon" aria-hidden>
              <step.icon size={20} strokeWidth={2} />
            </div>
            <h3 className="text-h3">{step.title}</h3>
            <p className="text-body mt-2">{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

type CompetitionCardData = {
  id: string;
  nom: string;
  slug: string;
  annee: number;
  lieu: string | null;
  image: string | null;
  _count?: { equipes: number };
};

export function CompetitionsGrid({
  competitions,
}: {
  competitions: CompetitionCardData[];
}) {
  if (competitions.length === 0) {
    return (
      <div className="home-competitions-empty">
        <UserRound size={28} className="text-slate-400" aria-hidden />
        <p className="text-body mt-3">
          Aucune compétition pour le moment. Créez la première pour démarrer.
        </p>
      </div>
    );
  }

  return (
    <div className="home-competitions-grid">
      {competitions.map((competition) => (
        <a
          key={competition.id}
          href={buildCompetitionSignInHref(competition.slug)}
          className="home-competition-card"
        >
          <div className="home-competition-card-media">
            {competition.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={competition.image}
                alt=""
                className="home-competition-card-image"
              />
            ) : (
              <div className="home-competition-card-placeholder" aria-hidden>
                <Trophy size={28} />
              </div>
            )}
            <span className="home-competition-card-year">{competition.annee}</span>
          </div>
          <div className="home-competition-card-body">
            <h3 className="text-h3">{competition.nom}</h3>
            {competition.lieu ? (
              <p className="text-body mt-1">{competition.lieu}</p>
            ) : null}
            <p className="home-competition-card-meta">
              {competition._count?.equipes ?? 0} équipe
              {(competition._count?.equipes ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
