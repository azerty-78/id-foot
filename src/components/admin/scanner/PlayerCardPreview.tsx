"use client";

import Image from "next/image";
import { PlayerCardQr } from "@/app/player-card/[id]/PlayerCardQr";
import type { ValidatedPlayer } from "./types";

function getInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function PlayerCardPreview({ player }: { player: ValidatedPlayer }) {
  const shortId = player.id.slice(0, 8).toUpperCase();

  return (
    <article className="scan-player-card">
      <header className="scan-player-card-header">
        <p>{player.equipe.competition.nom}</p>
      </header>

      <div className="scan-player-card-body">
        <div className="scan-player-card-photo">
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
          <p className="scan-player-card-name">
            {player.nom} {player.prenom}
          </p>
          <p className="scan-player-card-meta">
            #{player.numero}
            <span>{player.poste}</span>
          </p>
          <p className="scan-player-card-team">{player.equipe.nom}</p>
        </div>
      </div>

      <footer className="scan-player-card-footer">
        <p>ID: {shortId}</p>
        <div className="scan-player-card-qr">
          <PlayerCardQr
            token={player.qrToken}
            size={64}
            competitionLogo={player.equipe.competition.image}
          />
        </div>
      </footer>
    </article>
  );
}
