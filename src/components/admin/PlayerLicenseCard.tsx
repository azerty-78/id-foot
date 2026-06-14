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

  return (
    <article className={`player-license-card ${compact ? "player-license-card--compact" : ""} ${className}`.trim()}>
      <header className="player-license-card-header">
        <p>{player.equipe.competition.nom}</p>
      </header>

      <div className="player-license-card-body">
        <div className="player-license-card-photo">
          {player.photo ? (
            <Image
              src={player.photo}
              alt={`${player.prenom} ${player.nom}`}
              width={80}
              height={80}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{getInitials(player.prenom, player.nom)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
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
      </div>

      <footer className="player-license-card-footer">
        <div className="player-license-card-qr-wrap">
          <p className="player-license-card-qr-label">QR licence</p>
          <div className="player-license-card-qr">
            <PlayerCardQr token={player.qrToken} size={compact ? 56 : 72} />
          </div>
        </div>
        <p className="player-license-card-id">ID {shortId}</p>
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
