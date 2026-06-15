import {
  LayoutDashboard,
  QrCode,
  Shield,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { OutlineLink, PrimaryLink } from "@/components/admin/ui";

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
  competitionYear: number;
  competitionPlace?: string | null;
  competitionImage?: string | null;
  teamCount?: number;
};

export function CompetitionWorkspace({
  competitionName,
  competitionYear,
  competitionPlace,
  competitionImage,
  teamCount = 0,
}: CompetitionWorkspaceProps) {
  return (
    <div className="home-hero">
      <div className="home-hero-content">
        {competitionImage ? (
          <div className="competition-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={competitionImage}
              alt=""
              className="competition-cover-image"
            />
          </div>
        ) : null}

        <p className="text-section-label">Compétition · {competitionYear}</p>
        <h1 className="text-h1 home-hero-title">{competitionName}</h1>
        {competitionPlace ? (
          <p className="text-body home-hero-text">{competitionPlace}</p>
        ) : null}
        <p className="text-body home-hero-text">
          {teamCount} équipe{teamCount > 1 ? "s" : ""} inscrite
          {teamCount > 1 ? "s" : ""}. Gérez les licences, les clubs et le
          contrôle QR depuis cet espace.
        </p>

        <div className="home-hero-actions">
          <PrimaryLink href="/admin/scanner" icon={QrCode} className="w-full sm:w-auto">
            Lancer le scanner QR
          </PrimaryLink>
          <OutlineLink
            href="/admin/dashboard"
            icon={LayoutDashboard}
            className="w-full sm:w-auto"
          >
            Administration
          </OutlineLink>
        </div>
      </div>

      <div className="home-feature-grid">
        {competitionFeatureCards.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`home-feature-card ${item.featured ? "home-feature-card--scan" : ""}`}
          >
            {item.featured ? (
              <span className="home-feature-badge">
                <QrCode size={12} aria-hidden />
                Priorité terrain
              </span>
            ) : null}
            <h2 className="text-h3">{item.title}</h2>
            <p className="text-body mt-2">{item.text}</p>
          </a>
        ))}
      </div>
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
          href={`/${competition.slug}`}
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
