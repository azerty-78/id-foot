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
import { PlayerLicenseCard } from "@/components/admin/PlayerLicenseCard";
import { GhostButton, OutlineLink, PrimaryButton } from "@/components/admin/ui";
import { toPlayerLicenseCardPlayer } from "@/lib/playerLicenseCardPlayer";
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
  const [cardViewPlayerId, setCardViewPlayerId] = useState<string | null>(null);
  const showCard = cardViewPlayerId === player.id;

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
              Accès au joueur autorisée
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
            layout="column"
            competition={[
              player.equipe.competition.nom,
              String(player.equipe.competition.annee),
              player.equipe.competition.lieu,
            ]
              .filter(Boolean)
              .join(" · ")}
            competitionLogo={player.equipe.competition.image}
            className="scan-success-identity"
          />
        ) : (
          <PlayerLicenseCard
            player={toPlayerLicenseCardPlayer(player)}
            compact
            className="scan-success-card"
          />
        )}

        <div className="scan-success-actions">
          <PrimaryButton
            type="button"
            icon={ScanLine}
            onClick={onNextScan}
            className="scan-next-btn w-full"
          >
            Scanner le suivant
            <kbd className="scan-kbd">Entrée</kbd>
          </PrimaryButton>

          <div className="scan-success-actions-row">
            <GhostButton
              type="button"
              icon={CreditCard}
              onClick={() =>
                setCardViewPlayerId(showCard ? null : player.id)
              }
              className="scan-action-btn flex-1"
            >
              {showCard ? "Identité" : "Carte"}
            </GhostButton>
            <OutlineLink
              href={`/admin/players/${player.id}`}
              icon={UserRound}
              className="scan-action-btn flex-1"
            >
              Fiche
            </OutlineLink>
          </div>
        </div>

        <p className="scan-success-session">
          <ArrowRight size={14} aria-hidden />
          {validatedCount} joueur{validatedCount > 1 ? "s" : ""} validé
          {validatedCount > 1 ? "s" : ""} cette session
        </p>

        <p className="scan-success-back-hint">Retour système · glisser pour fermer</p>
      </div>
    </div>
  );
}
