"use client";

import Image from "next/image";
import { Download, Eye } from "lucide-react";
import { PlayerCardQr } from "@/app/player-card/[id]/PlayerCardQr";
import { GhostLink, OutlineButton } from "@/components/admin/ui";

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
    competition: { nom: string };
  };
};

type PlayerLicenseCardProps = {
  player: PlayerLicenseCardPlayer;
  onDownload?: (id: string) => void;
  downloading?: boolean;
  compact?: boolean;
  className?: string;
};

const PHOTO_PX = { default: 100, compact: 92 } as const;
const QR_PX = { default: 128, compact: 118 } as const;

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function LicenseField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="player-license-card-field">
      <dt className="player-license-card-field-label">{label}</dt>
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
  className = "",
}: PlayerLicenseCardProps) {
  const shortId = player.id.slice(0, 8).toUpperCase();
  const sizeKey = compact ? "compact" : "default";
  const photoPx = PHOTO_PX[sizeKey];
  const qrPx = QR_PX[sizeKey];
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
        <span className="player-license-card-brand">ID FOOT</span>
        <p className="player-license-card-competition">
          {player.equipe.competition.nom}
        </p>
      </header>

      <div className="player-license-card-main">
        <div className="player-license-card-identity">
          <div
            className="player-license-card-photo"
            style={{ width: photoPx, height: photoPx }}
          >
            {player.photo ? (
              <Image
                src={player.photo}
                alt={fullName}
                width={photoPx}
                height={photoPx}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{getInitials(player.prenom, player.nom)}</span>
            )}
          </div>

          <dl className="player-license-card-fields">
            <LicenseField label="Nom" value={fullName} />
            <div className="player-license-card-field-row">
              <LicenseField
                label="Dorsal"
                value={player.numero != null ? `#${player.numero}` : "—"}
                highlight={player.numero != null}
              />
              <LicenseField label="Poste" value={player.poste?.trim() || "—"} />
            </div>
            <LicenseField label="Club" value={player.equipe.nom} />
          </dl>
        </div>

        <div className="player-license-card-qr-zone">
          <div
            className="player-license-card-qr"
            style={{ width: qrPx, height: qrPx }}
          >
            <PlayerCardQr token={player.qrToken} size={qrPx - 10} />
          </div>
          <span className="player-license-card-scan-hint">Scanner ici</span>
        </div>
      </div>

      <footer className="player-license-card-footer">
        <span className="player-license-card-licence">Licence joueur</span>
        <span className="player-license-card-id">ID {shortId}</span>
      </footer>

      {!compact && (
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
