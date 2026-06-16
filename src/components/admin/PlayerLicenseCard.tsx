"use client";

import Image from "next/image";
import { Download, Eye } from "lucide-react";
import { PlayerCardQr } from "@/app/player-card/[id]/PlayerCardQr";
import { GhostLink, OutlineButton } from "@/components/admin/ui";
import { getPlayerCardBrandLabel } from "@/lib/playerCardBrand";

export type PlayerLicenseCardPlayer = {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
  poste: string | null;
  photo: string | null;
  qrToken: string;
  equipe: {
    nom: string;
    competition: {
      nom: string;
      image?: string | null;
      abbreviation: string;
      fullControl: boolean;
    };
  };
};

type PlayerLicenseCardProps = {
  player: PlayerLicenseCardPlayer;
  onDownload?: (id: string) => void;
  downloading?: boolean;
  compact?: boolean;
  hideActions?: boolean;
  className?: string;
};

/** Grille 500×330 : QR 250px, quiet zone 16px → SVG ≈ 218px */
const QR_INNER_PX = { default: 218, compact: 174 } as const;

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function LicenseField({
  label,
  value,
  highlight = false,
  variant = "default",
  valueOnly = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  variant?: "default" | "name";
  valueOnly?: boolean;
}) {
  return (
    <div
      className={`player-license-card-field ${variant === "name" ? "player-license-card-field--name" : ""} ${valueOnly ? "player-license-card-field--value-only" : ""}`.trim()}
    >
      {!valueOnly ? (
        <dt className="player-license-card-field-label">{label}</dt>
      ) : (
        <dt className="sr-only">{label}</dt>
      )}
      <dd
        className={`player-license-card-field-value ${highlight ? "player-license-card-field-value--highlight" : ""}`.trim()}
      >
        {value}
      </dd>
    </div>
  );
}

export function PlayerLicenseCard({
  player,
  onDownload,
  downloading = false,
  compact = false,
  hideActions = false,
  className = "",
}: PlayerLicenseCardProps) {
  const qrInnerPx = QR_INNER_PX[compact ? "compact" : "default"];
  const fullName = `${player.prenom} ${player.nom}`;

  return (
    <article
      className={`player-license-card ${compact ? "player-license-card--compact" : ""} ${className}`.trim()}
    >
      {player.numero != null && (
        <span className="player-license-card-watermark" aria-hidden>
          {player.numero}
        </span>
      )}

      <header className="player-license-card-header">
        <span className="player-license-card-brand">
          {getPlayerCardBrandLabel(player.equipe.competition)}
        </span>
        <p className="player-license-card-competition">
          {player.equipe.competition.nom}
        </p>
      </header>

      <div className="player-license-card-main">
        <div className="player-license-card-identity">
          <div className="player-license-card-photo">
            {player.photo ? (
              <Image
                src={player.photo}
                alt={fullName}
                width={140}
                height={140}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{getInitials(player.prenom, player.nom)}</span>
            )}
          </div>

          <dl className="player-license-card-fields">
            <LicenseField label="Nom" value={fullName} variant="name" />
            <div className="player-license-card-field-row">
              <LicenseField
                label="Dorsal"
                value={player.numero != null ? `#${player.numero}` : "—"}
                highlight={player.numero != null}
                valueOnly
              />
              <LicenseField
                label="Poste"
                value={player.poste?.trim() || "—"}
                valueOnly
              />
            </div>
          </dl>
        </div>

        <div className="player-license-card-qr-zone">
          <div className="player-license-card-qr">
            <PlayerCardQr
              token={player.qrToken}
              size={qrInnerPx}
              competitionLogo={player.equipe.competition.image}
            />
          </div>
          <span className="player-license-card-scan-hint">Scanner ici</span>
        </div>
      </div>

      <footer className="player-license-card-footer">
        <span className="player-license-card-licence">Licence joueur</span>
        <span className="player-license-card-club">{player.equipe.nom}</span>
      </footer>

      {!compact && !hideActions && (
        <div className="player-license-card-actions">
          <GhostLink
            href={`/admin/players/${player.id}`}
            icon={Eye}
            size="sm"
            className="flex-1"
          >
            Fiche
          </GhostLink>
          {onDownload && (
            <OutlineButton
              type="button"
              icon={Download}
              size="sm"
              loading={downloading}
              className="flex-1"
              onClick={() => onDownload(player.id)}
            >
              PDF
            </OutlineButton>
          )}
        </div>
      )}
    </article>
  );
}
