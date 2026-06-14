"use client";

import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  ScanLine,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PlayerIdentityCard } from "@/components/admin/PlayerIdentityCard";
import { GhostButton, OutlineLink, PrimaryButton } from "@/components/admin/ui";
import { PlayerCardPreview } from "./PlayerCardPreview";
import type { ValidatedPlayer } from "./types";

type ScanSuccessOverlayProps = {
  player: ValidatedPlayer;
  validatedCount: number;
  onNextScan: () => void;
};

export function ScanSuccessOverlay({
  player,
  validatedCount,
  onNextScan,
}: ScanSuccessOverlayProps) {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    setShowCard(false);
  }, [player.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        event.preventDefault();
        onNextScan();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNextScan]);

  return (
    <div className="scan-success-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-success-title">
      <div className="scan-success-panel">
        <div className="scan-success-badge">
          <span className="scan-success-icon" aria-hidden>
            <BadgeCheck size={28} strokeWidth={2} />
          </span>
          <div>
            <p id="scan-success-title" className="scan-success-title">
              Joueur autorisé
            </p>
            <p className="scan-success-subtitle">
              Licence valide · participation confirmée
            </p>
          </div>
        </div>

        {!showCard ? (
          <PlayerIdentityCard
            prenom={player.prenom}
            nom={player.nom}
            numero={player.numero}
            poste={player.poste}
            equipe={player.equipe.nom}
            photo={player.photo}
            className="scan-success-identity"
          />
        ) : (
          <PlayerCardPreview player={player} />
        )}

        <div className="scan-success-meta">
          <p>{player.equipe.nom}</p>
          <p>
            {player.equipe.competition.nom} · {player.equipe.competition.annee}
            {player.equipe.competition.lieu ? ` · ${player.equipe.competition.lieu}` : ""}
          </p>
        </div>

        <div className="scan-success-actions">
          <PrimaryButton
            type="button"
            icon={ScanLine}
            onClick={onNextScan}
            className="w-full"
          >
            Scanner le suivant
            <kbd className="scan-kbd">Entrée</kbd>
          </PrimaryButton>

          <div className="scan-success-actions-row">
            <GhostButton
              type="button"
              icon={CreditCard}
              onClick={() => setShowCard((value) => !value)}
              className="flex-1"
            >
              {showCard ? "Vue identité" : "Afficher la carte"}
            </GhostButton>
            <OutlineLink
              href={`/admin/players/${player.id}`}
              icon={UserRound}
              className="flex-1"
            >
              Fiche complète
            </OutlineLink>
          </div>
        </div>

        <p className="scan-success-session">
          <ArrowRight size={14} aria-hidden />
          {validatedCount} joueur{validatedCount > 1 ? "s" : ""} validé
          {validatedCount > 1 ? "s" : ""} cette session
        </p>
      </div>
    </div>
  );
}
