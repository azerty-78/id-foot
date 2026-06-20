import { BadgeCheck, LogIn, QrCode, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AppLogo } from "@/components/brand/AppLogo";
import { PrimaryLink } from "@/components/admin/ui";
import { buildQrScanPath } from "@/lib/qrScanUrl";

type ScanAuthGateProps = {
  token: string;
};

export function ScanAuthGate({ token }: ScanAuthGateProps) {
  const signInHref = `/admin/signin?callbackUrl=${encodeURIComponent(buildQrScanPath(token))}`;

  return (
    <div className="scan-gate-page">
      <header className="scan-gate-header">
        <AppLogo size="sm" />
      </header>

      <main className="scan-gate-main">
        <div className="card-default scan-gate-card">
          <div className="scan-gate-icon" aria-hidden>
            <QrCode size={28} strokeWidth={2} />
          </div>

          <p className="text-section-label">Licence joueur</p>
          <h1 className="text-h2 mt-2">Connexion requise</h1>
          <p className="scan-gate-lead">
            Ce QR code renvoie vers une fiche joueur protégée. Connectez-vous avec
            un compte autorisé pour afficher les informations.
          </p>

          <PrimaryLink href={signInHref} icon={LogIn} className="w-full">
            Se connecter
          </PrimaryLink>

          <p className="scan-gate-hint">
            Après connexion, vous serez redirigé automatiquement vers cette fiche.
          </p>
        </div>
      </main>
    </div>
  );
}

type ScanAccessDeniedProps = {
  token: string;
};

export function ScanAccessDenied({ token }: ScanAccessDeniedProps) {
  return (
    <div className="scan-gate-page">
      <header className="scan-gate-header">
        <AppLogo size="sm" />
      </header>

      <main className="scan-gate-main">
        <div className="card-default scan-gate-card">
          <div className="scan-gate-icon scan-gate-icon--warning" aria-hidden>
            <ShieldAlert size={28} strokeWidth={2} />
          </div>

          <h1 className="text-h2">Accès refusé</h1>
          <p className="scan-gate-lead">
            Votre compte n&apos;a pas accès à la compétition de ce joueur.
          </p>

          <Link href={buildQrScanPath(token)} className="btn btn-outline btn-sm">
            Réessayer
          </Link>
        </div>
      </main>
    </div>
  );
}

type ScanPlayerResultProps = {
  player: {
    id: string;
    prenom: string;
    nom: string;
    numero: number | null;
    poste: string | null;
    licenseType?: "JOUEUR" | "PERSONNEL";
    fonctionPersonnel?: string | null;
    photo: string;
    equipe: {
      nom: string;
      competition: {
        nom: string;
        annee: number;
        lieu: string | null;
        image: string | null;
      };
    };
  };
};

export function ScanPlayerResult({ player }: ScanPlayerResultProps) {
  const isPersonnel = player.licenseType === "PERSONNEL";
  const metaLine = isPersonnel
    ? player.fonctionPersonnel ?? "Personnel"
    : `${player.numero != null ? `#${player.numero}` : "—"}${player.poste ? ` · ${player.poste}` : ""}`;
  const competitionLine = [
    player.equipe.competition.nom,
    String(player.equipe.competition.annee),
    player.equipe.competition.lieu,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="scan-gate-page">
      <header className="scan-gate-header">
        <AppLogo size="sm" />
      </header>

      <main className="scan-gate-main scan-gate-main--wide">
        <div className="scan-gate-success-badge">
          <span className="scan-gate-success-icon" aria-hidden>
            <BadgeCheck size={24} strokeWidth={2} />
          </span>
          <div>
            <p className="scan-gate-success-title">
              {isPersonnel ? "Personnel identifié" : "Licence valide"}
            </p>
            <p className="scan-gate-success-subtitle">
              {isPersonnel
                ? "Membre du staff autorisé"
                : "Joueur autorisé · participation confirmée"}
            </p>
          </div>
        </div>

        <div className="card-default scan-gate-player-card">
          <div className="scan-gate-player-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.photo}
              alt={`${player.prenom} ${player.nom}`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="scan-gate-player-name">
              {player.prenom} {player.nom}
            </p>
            <p className="scan-gate-player-meta">{metaLine}</p>
            <p className="scan-gate-player-team">{player.equipe.nom}</p>
            <p className="scan-gate-player-competition">{competitionLine}</p>
          </div>
        </div>

        <div className="scan-gate-actions">
          <Link href={`/admin/players/${player.id}`} className="btn btn-primary">
            Ouvrir la fiche complète
          </Link>
          <Link href="/admin/scanner" className="btn btn-outline">
            Retour au scanner
          </Link>
        </div>
      </main>
    </div>
  );
}
