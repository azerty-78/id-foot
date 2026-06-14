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

const PHOTO_PX = { default: 76, compact: 68 } as const;
const QR_PX = { default: 92, compact: 80 } as const;

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
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
        <div
          className="player-license-card-photo"
          style={{ width: photoPx, height: photoPx }}
        >
          {player.photo ? (
            <Image
              src={player.photo}
              alt={`${player.prenom} ${player.nom}`}
              width={photoPx}
              height={photoPx}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{getInitials(player.prenom, player.nom)}</span>
          )}
        </div>

        <div className="player-license-card-info">
          <p className="player-license-card-name">
            {player.prenom} {player.nom}
          </p>
          <p className="player-license-card-meta">
            {player.numero != null && (
              <span className="player-license-card-numero">#{player.numero}</span>
            )}
            {player.poste && <span>{player.poste}</span>}
          </p>
          <p className="player-license-card-team">{player.equipe.nom}</p>
        </div>

        <div className="player-license-card-qr-zone">
          <div
            className="player-license-card-qr"
            style={{ width: qrPx, height: qrPx }}
          >
            <PlayerCardQr token={player.qrToken} size={qrPx - 8} />
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
